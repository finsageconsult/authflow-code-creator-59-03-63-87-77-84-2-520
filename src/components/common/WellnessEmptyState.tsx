import { EmptyState } from '@/components/ui/empty-state';
import { Heart, Sparkles, Target, Calendar, BookOpen, Users } from 'lucide-react';

interface WellnessEmptyStateProps {
  type: 'sessions' | 'progress' | 'clients' | 'content' | 'goals';
  onAction?: () => void;
}

const emptyStateConfig = {
  sessions: {
    icon: <Calendar className="w-8 h-8 text-primary/60" />,
    title: "Your wellness journey awaits",
    description: "No sessions scheduled yet. That's perfectly okay - everyone starts somewhere, and we're here when you're ready.",
    supportiveMessage: "Remember: Taking the first step is the hardest part. You've got this! 💚",
    action: {
      label: "Explore Available Sessions",
      onClick: () => console.log('Navigate to sessions')
    }
  },
  progress: {
    icon: <Target className="w-8 h-8 text-primary/60" />,
    title: "Your progress story begins here",
    description: "Once you start engaging with sessions and tools, you'll see your financial wellness journey unfold here.",
    supportiveMessage: "Every expert was once a beginner. Your future self will thank you for starting today.",
    action: {
      label: "Take Your First Step",
      onClick: () => console.log('Navigate to getting started')
    }
  },
  clients: {
    icon: <Users className="w-8 h-8 text-primary/60" />,
    title: "Building connections, one client at a time",
    description: "Your client list will grow as you support more individuals on their financial wellness journeys.",
    supportiveMessage: "Every coach started with zero clients. Your expertise and empathy will draw the right people to you.",
    action: {
      label: "Review Available Opportunities",
      onClick: () => console.log('Navigate to opportunities')
    }
  },
  content: {
    icon: <BookOpen className="w-8 h-8 text-primary/60" />,
    title: "Knowledge is waiting to be shared",
    description: "Create and organize content that will help your clients build confidence and achieve their financial goals.",
    supportiveMessage: "Your insights and experience have the power to transform lives. Start sharing your wisdom.",
    action: {
      label: "Create Your First Resource",
      onClick: () => console.log('Navigate to content creation')
    }
  },
  goals: {
    icon: <Sparkles className="w-8 h-8 text-primary/60" />,
    title: "Your goals, your timeline",
    description: "Set meaningful financial milestones that align with your values and life circumstances.",
    supportiveMessage: "Progress isn't always linear, and that's completely normal. Celebrate every small win along the way.",
    action: {
      label: "Set Your First Goal",
      onClick: () => console.log('Navigate to goal setting')
    }
  }
};

export const WellnessEmptyState = ({ type, onAction }: WellnessEmptyStateProps) => {
  const config = emptyStateConfig[type];
  
  return (
    <EmptyState
      icon={config.icon}
      title={config.title}
      description={config.description}
      supportiveMessage={config.supportiveMessage}
      action={onAction ? { ...config.action, onClick: onAction } : config.action}
      className="my-8"
    />
  );
};