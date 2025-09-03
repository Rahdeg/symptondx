import React from 'react';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './card';

interface BaseEnhancedCardProps {
    className?: string;
    children?: React.ReactNode;
}

const getBaseClasses = (): string => {
    return 'transition-all duration-200';
};

const InteractiveCardComponent: React.FC<BaseEnhancedCardProps & { onClick?: () => void; disabled?: boolean }> = ({
    className = '',
    children,
    onClick,
    disabled = false
}) => {
    const interactiveClasses = disabled
        ? 'opacity-50 cursor-not-allowed'
        : 'hover:shadow-lg cursor-pointer hover:scale-[1.02] hover:border-primary/50';

    return (
        <Card
            className={cn(getBaseClasses(), interactiveClasses, className)}
            onClick={disabled ? undefined : onClick}
        >
            {children}
        </Card>
    );
};

interface StatCardProps extends BaseEnhancedCardProps {
    title: string;
    value: string | number;
    icon: LucideIcon;
    trend?: {
        value: number;
        isPositive: boolean;
    };
    loading?: boolean;
    description?: string;
}

const StatCardComponent: React.FC<StatCardProps> = ({
    className = '',
    title,
    value,
    icon: Icon,
    trend,
    loading = false,
    description
}) => {
    const renderTrend = (): React.ReactElement | null => {
        if (!trend) return null;

        const { value: trendValue, isPositive } = trend;
        const colorClass = isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400';
        const symbol = isPositive ? '+' : '';

        return (
            <span className={cn('text-sm font-medium flex items-center', colorClass)}>
                {symbol}{trendValue}%
            </span>
        );
    };

    return (
        <Card className={cn(getBaseClasses(), className)}>
            <CardContent className="p-6">
                <div className="flex items-center justify-between">
                    <div className="space-y-2 flex-1">
                        <p className="text-sm font-medium text-muted-foreground">
                            {title}
                        </p>
                        {loading ? (
                            <div className="space-y-2">
                                <div className="h-8 w-24 bg-muted animate-pulse rounded" />
                                {description && (
                                    <div className="h-4 w-32 bg-muted animate-pulse rounded" />
                                )}
                            </div>
                        ) : (
                            <div className="space-y-1">
                                <div className="flex items-center space-x-2">
                                    <p className="text-2xl font-bold">{value}</p>
                                    {renderTrend()}
                                </div>
                                {description && (
                                    <p className="text-sm text-muted-foreground">{description}</p>
                                )}
                            </div>
                        )}
                    </div>
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                        <Icon className="h-6 w-6 text-primary" />
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

interface ProgressCardProps extends BaseEnhancedCardProps {
    title: string;
    currentStep: number;
    totalSteps: number;
    steps: Array<{ label: string; completed: boolean; description?: string }>;
    showStepDetails?: boolean;
}

const ProgressCardComponent: React.FC<ProgressCardProps> = ({
    className = '',
    title,
    currentStep,
    totalSteps,
    steps,
    showStepDetails = false
}) => {
    const calculateProgress = (): number => {
        return Math.min((currentStep / totalSteps) * 100, 100);
    };

    const progress = calculateProgress();

    return (
        <Card className={cn(getBaseClasses(), className)}>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{title}</CardTitle>
                    <span className="text-sm text-muted-foreground font-medium">
                        {currentStep}/{totalSteps}
                    </span>
                </div>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Progress</span>
                        <span className="font-medium">{Math.round(progress)}%</span>
                    </div>
                    <div className="w-full bg-secondary rounded-full h-2">
                        <div
                            className="bg-primary h-2 rounded-full transition-all duration-500 ease-out"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                </div>
                <div className="space-y-3">
                    {steps.map((step, index) => (
                        <div key={index} className="flex items-start space-x-3">
                            <div className={cn(
                                'w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium mt-0.5',
                                step.completed
                                    ? 'bg-primary text-primary-foreground'
                                    : index === currentStep - 1
                                        ? 'bg-primary/20 text-primary border-2 border-primary'
                                        : 'bg-muted text-muted-foreground'
                            )}>
                                {step.completed ? '✓' : index + 1}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className={cn(
                                    'text-sm font-medium',
                                    step.completed ? 'text-foreground' : 'text-muted-foreground'
                                )}>
                                    {step.label}
                                </p>
                                {step.description && showStepDetails && (
                                    <p className="text-xs text-muted-foreground mt-1">
                                        {step.description}
                                    </p>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
};

interface FeatureCardProps extends BaseEnhancedCardProps {
    title: string;
    description: string;
    icon: LucideIcon;
    action?: {
        label: string;
        onClick: () => void;
    };
    badge?: string;
}

const FeatureCardComponent: React.FC<FeatureCardProps> = ({
    className = '',
    title,
    description,
    icon: Icon,
    action,
    badge
}) => {
    return (
        <Card className={cn(getBaseClasses(), 'group hover:shadow-lg', className)}>
            <CardContent className="p-6">
                <div className="space-y-4">
                    <div className="flex items-start justify-between">
                        <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                            <Icon className="h-6 w-6 text-primary" />
                        </div>
                        {badge && (
                            <span className="px-2 py-1 text-xs font-medium bg-primary/10 text-primary rounded-full">
                                {badge}
                            </span>
                        )}
                    </div>

                    <div className="space-y-2">
                        <h3 className="font-semibold text-lg">{title}</h3>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                            {description}
                        </p>
                    </div>

                    {action && (
                        <button
                            onClick={action.onClick}
                            className="w-full mt-4 px-4 py-2 text-sm font-medium text-primary bg-primary/10 hover:bg-primary/20 rounded-lg transition-colors"
                        >
                            {action.label}
                        </button>
                    )}
                </div>
            </CardContent>
        </Card>
    );
};

// Export all components
export { InteractiveCardComponent, StatCardComponent, ProgressCardComponent, FeatureCardComponent };
