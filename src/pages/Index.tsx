import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import { toast } from 'sonner';

type Screen = 'welcome' | 'checking' | 'success' | 'error' | 'stats';

const API_URL = 'https://functions.poehali.dev/53cef3f5-fcbc-46aa-99fd-e4e7ab31587b';

const Index = () => {
  const [screen, setScreen] = useState<Screen>('welcome');
  const [stats, setStats] = useState({ total: 0, verified: 0 });
  const [isLoading, setIsLoading] = useState(false);

  const mockUserData = {
    fid: Math.floor(Math.random() * 100000),
    username: 'demo_user',
    displayName: 'Demo User',
    verifiedAccount: true,
    verifiedChannel: true
  };

  const fetchStats = async () => {
    try {
      const response = await fetch(API_URL);
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  const handleStart = async () => {
    setIsLoading(true);
    setScreen('checking');
    
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mockUserData)
      });
      
      const data = await response.json();
      
      if (data.success && mockUserData.verifiedAccount && mockUserData.verifiedChannel) {
        setScreen('success');
        await fetchStats();
        toast.success('Добро пожаловать в waitlist!');
      } else {
        setScreen('error');
        toast.error('Проверьте подписки');
      }
    } catch (error) {
      setScreen('error');
      toast.error('Ошибка подключения');
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewStats = async () => {
    setScreen('stats');
    await fetchStats();
  };

  const renderScreen = () => {
    switch (screen) {
      case 'welcome':
        return (
          <div className="animate-fade-in space-y-8">
            <div className="text-center space-y-4">
              <div className="text-6xl mb-6">🚀</div>
              <h1 className="text-5xl font-bold bg-gradient-to-r from-primary via-purple-500 to-pink-500 bg-clip-text text-transparent">
                Waitlist Frame
              </h1>
              <p className="text-lg text-muted-foreground max-w-md mx-auto">
                Подпишитесь на аккаунт и канал, чтобы присоединиться к эксклюзивному списку ожидания
              </p>
            </div>
            
            <div className="space-y-4">
              <Button 
                onClick={handleStart} 
                size="lg" 
                className="w-full h-14 text-lg font-semibold hover-scale transition-all"
                disabled={isLoading}
              >
                <Icon name="Rocket" className="mr-2" size={24} />
                Присоединиться
              </Button>
              
              <Button 
                onClick={handleViewStats} 
                variant="outline" 
                size="lg"
                className="w-full h-14 text-lg hover-scale transition-all"
              >
                <Icon name="BarChart3" className="mr-2" size={24} />
                Статистика
              </Button>
            </div>
          </div>
        );

      case 'checking':
        return (
          <div className="animate-scale-in text-center space-y-6">
            <div className="relative inline-block">
              <div className="animate-spin rounded-full h-24 w-24 border-4 border-primary border-t-transparent" />
              <Icon name="Search" className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-primary" size={40} />
            </div>
            <h2 className="text-3xl font-bold">Проверяем подписки...</h2>
            <p className="text-muted-foreground">Это займёт всего пару секунд</p>
          </div>
        );

      case 'success':
        return (
          <div className="animate-scale-in text-center space-y-6">
            <div className="text-7xl mb-4">✅</div>
            <h2 className="text-4xl font-bold text-green-600">Поздравляем!</h2>
            <p className="text-lg text-muted-foreground max-w-md mx-auto">
              Вы успешно добавлены в waitlist. Мы уведомим вас о запуске!
            </p>
            
            <div className="pt-6 space-y-3">
              <Button 
                onClick={handleViewStats} 
                size="lg"
                className="w-full hover-scale transition-all"
              >
                <Icon name="Users" className="mr-2" size={20} />
                Посмотреть статистику
              </Button>
              <Button 
                onClick={() => setScreen('welcome')} 
                variant="outline"
                size="lg"
                className="w-full"
              >
                На главную
              </Button>
            </div>
          </div>
        );

      case 'error':
        return (
          <div className="animate-scale-in text-center space-y-6">
            <div className="text-7xl mb-4">❌</div>
            <h2 className="text-4xl font-bold text-red-600">Упс!</h2>
            <div className="space-y-3">
              <p className="text-lg text-muted-foreground">
                Для добавления в waitlist необходимо:
              </p>
              <div className="space-y-2 text-left max-w-sm mx-auto">
                <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                  <Icon name="UserPlus" size={20} className="text-primary" />
                  <span>Подписаться на аккаунт</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                  <Icon name="Hash" size={20} className="text-primary" />
                  <span>Подписаться на канал</span>
                </div>
              </div>
            </div>
            
            <Button 
              onClick={() => setScreen('welcome')} 
              size="lg"
              className="w-full mt-6 hover-scale transition-all"
            >
              <Icon name="ArrowLeft" className="mr-2" size={20} />
              Назад
            </Button>
          </div>
        );

      case 'stats':
        return (
          <div className="animate-fade-in space-y-8">
            <div className="text-center">
              <h2 className="text-4xl font-bold mb-2">Статистика Waitlist</h2>
              <p className="text-muted-foreground">Актуальная информация о участниках</p>
            </div>
            
            <div className="grid gap-4">
              <Card className="p-6 hover-scale transition-all border-2">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground font-medium">Всего участников</p>
                    <p className="text-4xl font-bold text-primary">{stats.total}</p>
                  </div>
                  <Icon name="Users" size={48} className="text-primary/20" />
                </div>
              </Card>
              
              <Card className="p-6 hover-scale transition-all border-2">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground font-medium">Верифицировано</p>
                    <p className="text-4xl font-bold text-green-600">{stats.verified}</p>
                  </div>
                  <Icon name="CheckCircle" size={48} className="text-green-600/20" />
                </div>
              </Card>
            </div>
            
            <Button 
              onClick={() => setScreen('welcome')} 
              variant="outline"
              size="lg"
              className="w-full hover-scale transition-all"
            >
              <Icon name="Home" className="mr-2" size={20} />
              На главную
            </Button>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center p-4">
      <Card className="w-full max-w-lg p-8 backdrop-blur-sm bg-card/95 shadow-2xl border-2">
        {renderScreen()}
      </Card>
    </div>
  );
};

export default Index;
