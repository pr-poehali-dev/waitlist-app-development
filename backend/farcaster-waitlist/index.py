'''
Business: Farcaster Frame waitlist API - check subscriptions and add users
Args: event with httpMethod, body, queryStringParameters; context with request_id
Returns: HTTP response with waitlist status and user data
'''

import json
import os
from typing import Dict, Any, Optional
from datetime import datetime
import psycopg2
from psycopg2.extras import RealDictCursor


def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    method: str = event.get('httpMethod', 'GET')
    
    # Handle CORS OPTIONS request
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-User-Id',
                'Access-Control-Max-Age': '86400'
            },
            'body': ''
        }
    
    headers = {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
    }
    
    # Get database connection
    database_url = os.environ.get('DATABASE_URL')
    if not database_url:
        return {
            'statusCode': 500,
            'headers': headers,
            'body': json.dumps({'error': 'Database not configured'})
        }
    
    try:
        conn = psycopg2.connect(database_url)
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        
        # GET: Get waitlist stats
        if method == 'GET':
            cursor.execute('SELECT COUNT(*) as total FROM waitlist')
            result = cursor.fetchone()
            total_count = result['total'] if result else 0
            
            cursor.execute(
                'SELECT COUNT(*) as verified FROM waitlist WHERE verified_account = TRUE AND verified_channel = TRUE'
            )
            result = cursor.fetchone()
            verified_count = result['verified'] if result else 0
            
            cursor.close()
            conn.close()
            
            return {
                'statusCode': 200,
                'headers': headers,
                'isBase64Encoded': False,
                'body': json.dumps({
                    'total': total_count,
                    'verified': verified_count
                })
            }
        
        # POST: Add user to waitlist
        if method == 'POST':
            body_data = json.loads(event.get('body', '{}'))
            
            fid = body_data.get('fid')
            username = body_data.get('username', '')
            display_name = body_data.get('displayName', '')
            verified_account = body_data.get('verifiedAccount', False)
            verified_channel = body_data.get('verifiedChannel', False)
            
            if not fid:
                cursor.close()
                conn.close()
                return {
                    'statusCode': 400,
                    'headers': headers,
                    'body': json.dumps({'error': 'FID is required'})
                }
            
            # Check if user already exists
            cursor.execute('SELECT fid FROM waitlist WHERE fid = %s', (fid,))
            existing = cursor.fetchone()
            
            if existing:
                # Update existing user
                cursor.execute(
                    '''UPDATE waitlist 
                       SET username = %s, display_name = %s, 
                           verified_account = %s, verified_channel = %s
                       WHERE fid = %s
                       RETURNING fid, username, display_name, verified_account, verified_channel''',
                    (username, display_name, verified_account, verified_channel, fid)
                )
            else:
                # Insert new user
                cursor.execute(
                    '''INSERT INTO waitlist (fid, username, display_name, verified_account, verified_channel)
                       VALUES (%s, %s, %s, %s, %s)
                       RETURNING fid, username, display_name, verified_account, verified_channel''',
                    (fid, username, display_name, verified_account, verified_channel)
                )
            
            user = cursor.fetchone()
            conn.commit()
            cursor.close()
            conn.close()
            
            # Convert to dict
            user_dict = dict(user)
            
            return {
                'statusCode': 200,
                'headers': headers,
                'isBase64Encoded': False,
                'body': json.dumps({
                    'success': True,
                    'user': user_dict,
                    'isNew': not bool(existing)
                })
            }
        
        cursor.close()
        conn.close()
        
        return {
            'statusCode': 405,
            'headers': headers,
            'body': json.dumps({'error': 'Method not allowed'})
        }
        
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': headers,
            'body': json.dumps({'error': str(e)})
        }