// services/analyticsService.ts
// Service for tracking user behavior and application analytics

export interface AnalyticsEvent {
  event: string;
  category: string;
  action: string;
  label?: string;
  value?: number;
  userId?: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

export interface ErrorLog {
  errorId: string;
  error: string;
  message: string;
  stack?: string;
  component?: string;
  userId?: string;
  timestamp: Date;
  severity: 'low' | 'medium' | 'high' | 'critical';
  metadata?: Record<string, any>;
}

class AnalyticsService {
  private events: AnalyticsEvent[] = [];
  private errors: ErrorLog[] = [];

  // Track user events
  trackEvent(eventData: Omit<AnalyticsEvent, 'timestamp'>) {
    const event: AnalyticsEvent = {
      ...eventData,
      timestamp: new Date()
    };
    
    // In a real app, this would send to an analytics service
    this.events.push(event);
    console.log('[Analytics] Event tracked:', event);
    
    // For demo purposes, we'll keep only the last 100 events
    if (this.events.length > 100) {
      this.events.shift();
    }
  }

  // Log errors with context
  logError(errorData: Omit<ErrorLog, 'errorId' | 'timestamp'>) {
    const errorLog: ErrorLog = {
      ...errorData,
      errorId: this.generateErrorId(),
      timestamp: new Date()
    };
    
    // In a real app, this would send to an error tracking service
    this.errors.push(errorLog);
    console.error('[Analytics] Error logged:', errorLog);
    
    // For demo purposes, we'll keep only the last 100 errors
    if (this.errors.length > 100) {
      this.errors.shift();
    }
  }

  // Get all events (for admin dashboard)
  getEvents(limit?: number): AnalyticsEvent[] {
    const events = [...this.events].reverse(); // Most recent first
    return limit ? events.slice(0, limit) : events;
  }

  // Get all errors (for admin dashboard)
  getErrors(limit?: number): ErrorLog[] {
    const errors = [...this.errors].reverse(); // Most recent first
    return limit ? errors.slice(0, limit) : errors;
  }

  // Get analytics summary
  getSummary() {
    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    const todayEvents = this.events.filter(event => event.timestamp >= oneDayAgo);
    const weekEvents = this.events.filter(event => event.timestamp >= oneWeekAgo);
    const todayErrors = this.errors.filter(error => error.timestamp >= oneDayAgo);
    const weekErrors = this.errors.filter(error => error.timestamp >= oneWeekAgo);
    
    // Group events by category
    const eventCategories: Record<string, number> = {};
    todayEvents.forEach(event => {
      eventCategories[event.category] = (eventCategories[event.category] || 0) + 1;
    });
    
    // Group errors by severity
    const errorSeverities: Record<string, number> = {
      low: 0,
      medium: 0,
      high: 0,
      critical: 0
    };
    todayErrors.forEach(error => {
      errorSeverities[error.severity] = (errorSeverities[error.severity] || 0) + 1;
    });
    
    return {
      events: {
        today: todayEvents.length,
        week: weekEvents.length,
        categories: eventCategories
      },
      errors: {
        today: todayErrors.length,
        week: weekErrors.length,
        severities: errorSeverities
      }
    };
  }

  // Get booking-related analytics
  getBookingAnalytics() {
    const bookingEvents = this.events.filter(event => 
      event.category === 'booking' || event.event.includes('booking')
    );
    
    const totalBookings = bookingEvents.filter(event => 
      event.action === 'created' || event.event === 'booking_created'
    ).length;
    
    const completedBookings = bookingEvents.filter(event => 
      event.action === 'completed' || event.event === 'booking_completed'
    ).length;
    
    const cancelledBookings = bookingEvents.filter(event => 
      event.action === 'cancelled' || event.event === 'booking_cancelled'
    ).length;
    
    return {
      totalBookings,
      completedBookings,
      cancelledBookings,
      conversionRate: totalBookings > 0 ? Math.round((completedBookings / totalBookings) * 100) : 0
    };
  }

  // Clear analytics data
  clearData() {
    this.events = [];
    this.errors = [];
  }

  // Generate a unique error ID
  private generateErrorId(): string {
    return 'err_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }
}

// Export singleton instance
export const analyticsService = new AnalyticsService();