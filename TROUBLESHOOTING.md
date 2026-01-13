# 🔧 DevConnect - Troubleshooting Guide

## Common Issues & Solutions

### **Import Errors**

#### Issue: "does not provide an export named..."
**Solution:** Check if the component is a default or named export.

```javascript
// Default export (no curly braces)
import LoadingSpinner from './LoadingSpinner';

// Named exports (with curly braces)
import { LoadingPage, LoadingOverlay } from './LoadingSpinner';

// Mixed
import LoadingSpinner, { LoadingPage } from './LoadingSpinner';
```

**Quick Reference:**
- `LoadingSpinner` - default export ✅
- `LoadingPage`, `LoadingOverlay` - named exports ✅
- `Button`, `Card`, `Avatar`, `Badge`, `Input` - default exports via index.js ✅

---

### **Server Issues**

#### Issue: "EADDRINUSE: address already in use"
**Solution:** Port is already in use
```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Mac/Linux
lsof -i :5000
kill -9 <PID>
```

#### Issue: "MongoDB connection failed"
**Solution:** Check your `.env` file
```bash
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
```

---

### **Socket.io Issues**

#### Issue: Socket not connecting
**Solution:** 
1. Check if server is running
2. Verify `CLIENT_URL` in server `.env`
3. Check browser console for errors
4. Ensure token is valid

```javascript
// Check connection status
socketService.isConnected() // Should return true
```

---

### **Build Issues**

#### Issue: "Module not found"
**Solution:**
```bash
# Clear cache and reinstall
cd devconnect/client
rm -rf node_modules package-lock.json
npm install

# Or for server
cd devconnect/server
rm -rf node_modules package-lock.json
npm install
```

#### Issue: Vite build fails
**Solution:** Check for missing dependencies
```bash
npm install
npm run build
```

---

### **API Errors**

#### Issue: 401 Unauthorized
**Solution:** Token expired or invalid
- Clear localStorage
- Login again
- Check token in browser DevTools → Application → Local Storage

#### Issue: 404 Not Found
**Solution:** 
- Check API endpoint URL
- Verify server is running
- Check route is registered in `server.js`

#### Issue: 500 Internal Server Error
**Solution:**
- Check server console logs
- Verify MongoDB is running
- Check database connection
- Review API endpoint code

---

### **UI Issues**

#### Issue: Styles not applying
**Solution:**
1. Check if Tailwind is configured
2. Clear browser cache
3. Restart dev server
4. Check `index.css` is imported

#### Issue: Components not rendering
**Solution:**
1. Check browser console for errors
2. Verify component imports
3. Check if data is loading
4. Use React DevTools

---

### **Real-Time Issues**

#### Issue: Messages not sending
**Solution:**
1. Check Socket.io connection
2. Verify conversation exists
3. Check server logs
4. Ensure both users are online

#### Issue: Notifications not appearing
**Solution:**
1. Check notification store
2. Verify Socket.io events
3. Check NotificationCenter is open
4. Review server notification routes

---

### **Performance Issues**

#### Issue: Slow page loads
**Solution:**
1. Check network tab in DevTools
2. Optimize images (use compression)
3. Implement pagination
4. Use React Query caching
5. Add loading states

#### Issue: High memory usage
**Solution:**
1. Check for memory leaks
2. Clean up useEffect hooks
3. Unsubscribe from Socket events
4. Use React.memo for expensive components

---

### **Database Issues**

#### Issue: Data not saving
**Solution:**
1. Check MongoDB connection
2. Verify schema matches data
3. Check for validation errors
4. Review server logs

#### Issue: Queries are slow
**Solution:**
1. Add database indexes
2. Limit query results
3. Use projection to select fields
4. Optimize populate queries

---

## Development Tips

### **Hot Reload Not Working**
```bash
# Restart both servers
# Terminal 1 - Server
cd devconnect/server
npm run dev

# Terminal 2 - Client  
cd devconnect/client
npm run dev
```

### **Clear All Caches**
```bash
# Browser
# Press Ctrl+Shift+Delete (or Cmd+Shift+Delete on Mac)
# Clear cache and cookies

# Node modules
rm -rf node_modules package-lock.json
npm install

# Vite cache
rm -rf .vite
```

### **Environment Variables**
Always restart servers after changing `.env` files!

---

## Debugging Tools

### **Browser DevTools**
- **Console** - Check for errors
- **Network** - Monitor API calls
- **Application** - Check localStorage, cookies
- **React DevTools** - Inspect component state

### **Server Logs**
All server logs show in terminal. Look for:
- MongoDB connection status
- API endpoint calls
- Socket.io connections
- Error stack traces

### **VS Code Extensions**
Recommended:
- ES7+ React/Redux snippets
- Tailwind CSS IntelliSense
- ESLint
- Prettier
- MongoDB for VS Code

---

## Quick Fixes

### **Reset Everything**
```bash
# Stop all servers
# Clear localStorage in browser
# Delete node_modules in both client and server
# Reinstall dependencies
# Restart servers
```

### **Test Socket.io Connection**
```javascript
// In browser console
localStorage.getItem('token') // Should show your token
// Check Network tab → WS (WebSocket) for connection
```

### **Test API Endpoint**
```bash
# Use curl or Postman
curl http://localhost:5000/api/user
```

---

## Getting Help

### **Where to Look:**
1. Browser Console (F12)
2. Server Terminal (error logs)
3. Network Tab (failed requests)
4. React DevTools (component state)

### **Common Error Messages:**

**"Cannot read property of undefined"**
- Data hasn't loaded yet
- Add null checks: `user?.name`
- Use loading states

**"Maximum update depth exceeded"**
- Infinite loop in useEffect
- Add dependencies to useEffect array
- Check for circular updates

**"Failed to fetch"**
- Server not running
- Wrong API URL
- CORS issue
- Network error

---

## Still Having Issues?

1. Check the browser console for specific errors
2. Review server logs for API errors
3. Verify all dependencies are installed
4. Ensure MongoDB is running
5. Check environment variables
6. Clear all caches and restart

**Most issues are fixed by:**
- Restarting servers
- Clearing cache
- Reinstalling dependencies
- Checking environment variables

Happy debugging! 🐛🔨
