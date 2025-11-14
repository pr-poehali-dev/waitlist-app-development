-- Create waitlist table for Farcaster Frame
CREATE TABLE IF NOT EXISTS waitlist (
    id SERIAL PRIMARY KEY,
    fid INTEGER NOT NULL UNIQUE,
    username VARCHAR(255) NOT NULL,
    display_name VARCHAR(255),
    verified_account BOOLEAN DEFAULT FALSE,
    verified_channel BOOLEAN DEFAULT FALSE,
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_waitlist_fid ON waitlist(fid);
CREATE INDEX IF NOT EXISTS idx_waitlist_joined_at ON waitlist(joined_at DESC);