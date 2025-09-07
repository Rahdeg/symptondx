# AI Optimization Setup Guide

## 🚀 Quick Setup Steps

### 1. **Database Migration**
Run the database migration to add the new AI usage tracking table:

```bash
# Generate migration
yarn db:generate

# Apply migration
yarn db:migrate
```

### 2. **Environment Variables**
Ensure you have the following environment variables set:

```env
# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key_here

# Inngest Configuration (if using background jobs)
INNGEST_EVENT_KEY=
INNGEST_SIGNING_KEY=
```

### 3. **Inngest Setup** (Optional but Recommended)
If you want to use background processing:

1. **Sign up for Inngest**: https://inngest.com
2. **Create a new app** in your Inngest dashboard
3. **Get your keys** from the Inngest dashboard
4. **Add environment variables** as shown above
5. **Deploy your functions** to Inngest

### 4. **Test the Implementation**

#### Test Rate Limiting:
```typescript
// This should work
await RateLimiter.checkAIDiagnosisLimit(userId);

// This should fail after 10 requests per hour
for (let i = 0; i < 11; i++) {
  await RateLimiter.checkAIDiagnosisLimit(userId);
}
```

#### Test Usage Tracking:
```typescript
// Check current usage
const usage = await AIUsageTracker.getUserUsage(userId);
console.log(usage); // { daily: 0, monthly: 0, totalCost: 0 }

// Record usage
await AIUsageTracker.recordUsage({
  userId,
  tokensUsed: 1500,
  cost: 0.00225,
  model: "gpt-3.5-turbo",
  endpoint: "ai-diagnosis",
  timestamp: new Date(),
});
```

#### Test Caching:
```typescript
// First call - should hit AI
const result1 = await OptimizedAIService.analyzeSymptomsWithAI(input, userId);

// Second call with same input - should hit cache
const result2 = await OptimizedAIService.analyzeSymptomsWithAI(input, userId);
```

## 🔧 Configuration Options

### **Rate Limiting Configuration**
You can adjust rate limits in `src/lib/rate-limiter.ts`:

```typescript
private static readonly AI_DIAGNOSIS_CONFIG: RateLimitConfig = {
  windowMs: 60 * 60 * 1000, // 1 hour
  maxRequests: 10, // 10 AI diagnoses per hour
  keyGenerator: (userId: string) => `ai-diagnosis:${userId}`,
};
```

### **Usage Limits Configuration**
Adjust usage limits in `src/lib/ai-usage-tracker.ts`:

```typescript
private static readonly DAILY_LIMIT = 10000; // tokens per day
private static readonly MONTHLY_LIMIT = 100000; // tokens per month
private static readonly PER_REQUEST_LIMIT = 2000; // tokens per request
```

### **Cache Configuration**
Adjust cache settings in `src/lib/ai-cache.ts`:

```typescript
private static readonly CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours
private static readonly MAX_CACHE_SIZE = 1000; // Maximum cached predictions
```

## 📊 Monitoring & Analytics

### **View Usage Statistics**
```typescript
// Get service statistics
const stats = OptimizedAIService.getServiceStats();
console.log(stats);
// {
//   cache: { size: 5, maxSize: 1000, hitRate: 0 },
//   rateLimit: { totalKeys: 2, activeWindows: 1, expiredWindows: 0 },
//   usage: { limits: { dailyLimit: 10000, monthlyLimit: 100000, perRequestLimit: 2000 } }
// }
```

### **Database Queries for Analytics**
```sql
-- Daily usage by user
SELECT 
  u.email,
  SUM(ail.tokens_used) as daily_tokens,
  SUM(ail.cost::numeric) as daily_cost
FROM ai_usage_logs ail
JOIN users u ON ail.user_id = u.id
WHERE ail.created_at >= CURRENT_DATE
GROUP BY u.id, u.email
ORDER BY daily_tokens DESC;

-- Most expensive requests
SELECT 
  u.email,
  ail.tokens_used,
  ail.cost,
  ail.model,
  ail.endpoint,
  ail.created_at
FROM ai_usage_logs ail
JOIN users u ON ail.user_id = u.id
ORDER BY ail.cost DESC
LIMIT 10;
```

## 🚨 Troubleshooting

### **Common Issues:**

1. **Rate Limit Errors**
   - Check if user has exceeded hourly/daily limits
   - Verify rate limiter configuration
   - Check for expired entries in rate limiter

2. **Usage Limit Errors**
   - Verify user hasn't exceeded token limits
   - Check database connection for usage tracking
   - Verify AI usage logs table exists

3. **Cache Issues**
   - Check if cache is working by looking for "Cache hit" logs
   - Verify cache cleanup is running
   - Check cache size limits

4. **Inngest Issues**
   - Verify Inngest environment variables
   - Check Inngest dashboard for function status
   - Verify webhook endpoint is accessible

### **Debug Mode**
Enable debug logging by setting:

```env
DEBUG=ai-optimization:*
```

## 📈 Performance Monitoring

### **Key Metrics to Monitor:**
- **Token Usage**: Daily/monthly consumption per user
- **Cache Hit Rate**: Percentage of requests served from cache
- **Rate Limit Violations**: Number of blocked requests
- **Processing Times**: Average AI processing duration
- **Error Rates**: Failed requests and retry attempts

### **Alerts to Set Up:**
- Usage approaching 80% of daily limit
- Rate limit violations exceeding threshold
- AI processing failures above 5%
- Cache hit rate below 20%

## 🔄 Maintenance

### **Regular Tasks:**
1. **Monitor usage patterns** and adjust limits if needed
2. **Clean up expired cache entries** (automatic)
3. **Review rate limit effectiveness** and adjust if needed
4. **Update cost calculations** if OpenAI pricing changes
5. **Analyze error patterns** and improve fallback logic

### **Monthly Reviews:**
- Review usage statistics and cost trends
- Adjust rate limits based on user behavior
- Update cache configuration for optimal performance
- Review and update AI prompts for better efficiency

This setup ensures your AI application is optimized, cost-effective, and provides excellent user experience while protecting your OpenAI quota.
