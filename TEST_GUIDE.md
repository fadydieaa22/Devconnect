# DevConnect Testing Guide

## Prerequisites
- MongoDB running on localhost:27017
- Server running on port 5000
- Client running on port 5173/5174

## Test Scenarios

### 🧪 Test 1: Post Deletion Feature

**Steps:**
1. Login to your account
2. Navigate to Feed page
3. Create a new post:
   - Click "Create Post" button
   - Add some content (e.g., "Test post for deletion")
   - Optionally add an image
   - Click "Post"
4. Find your newly created post in the feed
5. Click the **three dots menu (⋮)** in the top-right corner of the post
6. Look for "Delete Post" option (should have a trash icon 🗑️)
7. Click "Delete Post"
8. Confirm the deletion in the popup
9. Verify the post disappears from the feed

**Expected Results:**
- ✅ Delete option only appears on YOUR posts
- ✅ Delete option is red/danger colored
- ✅ Confirmation dialog appears
- ✅ Success toast notification shows
- ✅ Post is removed from UI immediately
- ✅ Post is deleted from database

**Troubleshooting:**
- If delete button doesn't appear: Check if you're the post author
- If deletion fails: Check browser console and server logs

---

### 🧪 Test 2: Messaging from Users Page

**Steps:**
1. Login to your account
2. Navigate to Users page (Discover Developers)
3. Find any user in the list (not yourself)
4. Look for the **message icon button (💬)** next to the Follow button
5. Click the message icon
6. You should be redirected to the Messages page
7. Verify a conversation with that user appears in the sidebar
8. Type a test message and send it

**Expected Results:**
- ✅ Message button appears for all users except yourself
- ✅ Clicking creates/finds conversation
- ✅ Redirects to /messages page
- ✅ Conversation appears in sidebar
- ✅ Can send messages successfully

---

### 🧪 Test 3: Messaging from Profile Page

**Steps:**
1. Login to your account
2. Navigate to another user's profile (click their name anywhere)
3. Look for the **"Message" button** next to the "Follow" button
4. Click the "Message" button
5. You should be redirected to Messages page
6. Verify the conversation is opened
7. Send a test message

**Expected Results:**
- ✅ Message button appears on other users' profiles
- ✅ Message button has a message icon (💬)
- ✅ Clicking redirects to messages
- ✅ Conversation is pre-selected
- ✅ Can send messages immediately

---

### 🧪 Test 4: Post Images Loading

**Steps:**
1. Create a post with images:
   - Click "Create Post"
   - Add text content
   - Click "Add Images" button
   - Select 1-3 images from your computer
   - Click "Post"
2. View the post in the feed
3. Verify images display correctly
4. Logout and login with a different account
5. View the same post
6. Verify images still load correctly

**Expected Results:**
- ✅ Images upload successfully
- ✅ Images display in the post
- ✅ Images load for the post author
- ✅ Images load for other users viewing the post
- ✅ No console errors about failed image loads
- ✅ Images use correct URL format

**Check URLs:**
- Open browser DevTools (F12)
- Go to Network tab
- Look at image requests
- URLs should be like: `http://localhost:5000/uploads/filename.jpg`

---

### 🧪 Test 5: Project Images

**Steps:**
1. Create a new project:
   - Go to Dashboard
   - Click "New Project"
   - Fill in project details
   - Upload a project image
   - Click "Create"
2. Navigate to Projects page
3. Find your project in the grid
4. Verify the project image displays
5. Click on the project to view details
6. Verify image still displays correctly

**Expected Results:**
- ✅ Project image uploads successfully
- ✅ Image displays on Projects page
- ✅ Image displays on Project detail page
- ✅ Image displays on your profile's project section

---

### 🧪 Test 6: Avatar Images

**Steps:**
1. Go to Edit Profile
2. Upload a new avatar image
3. Save changes
4. Check your avatar in:
   - Navigation bar
   - Dashboard
   - Your posts
   - Messages
   - Profile page
5. Verify it loads correctly in all locations

**Expected Results:**
- ✅ Avatar uploads successfully
- ✅ Avatar displays in all locations
- ✅ Avatar uses correct URL format
- ✅ Other users can see your avatar

---

## Manual Testing Checklist

### Post Features
- [ ] Can create posts with text only
- [ ] Can create posts with images
- [ ] Can delete own posts
- [ ] Cannot delete others' posts
- [ ] Delete confirmation works
- [ ] Images load correctly in posts
- [ ] Post author avatar displays

### Messaging Features  
- [ ] Message button on Users page works
- [ ] Message button on Profile page works
- [ ] Conversation is created/found
- [ ] Navigation to messages works
- [ ] Can send messages
- [ ] Messages appear in real-time
- [ ] User avatars load in messages

### Project Features
- [ ] Can create projects
- [ ] Project images upload
- [ ] Projects display on Projects page
- [ ] Project images load correctly
- [ ] Can view project details

### Image Loading
- [ ] Post images load for author
- [ ] Post images load for other users
- [ ] Project images load correctly
- [ ] Avatar images load correctly
- [ ] No broken image icons (🖼️❌)
- [ ] No 404 errors in console

---

## Quick Test Script

To test image URLs are working, open browser console and run:

```javascript
// Test image URL utility
const testUrls = [
  '/uploads/test.jpg',
  'http://example.com/image.jpg',
  'https://cloudinary.com/image.jpg',
  'uploads/test.jpg'
];

testUrls.forEach(url => {
  console.log(`Input: ${url}`);
  console.log(`Output: ${getImageUrl(url)}`);
  console.log('---');
});
```

---

## Common Issues & Solutions

### Issue: Images not loading (404 errors)
**Solution:** 
- Check server is serving `/uploads` folder
- Verify files exist in `devconnect/server/uploads/`
- Check CORS headers are set correctly

### Issue: Delete button not appearing
**Solution:**
- Verify you're logged in
- Confirm you're viewing YOUR post
- Check `currentUser._id === post.author._id`

### Issue: Message button not working
**Solution:**
- Check you're logged in
- Verify token is valid
- Check browser console for errors
- Ensure conversation API endpoint is working

### Issue: Server not starting
**Solution:**
- Kill existing process on port 5000
- Run: `netstat -ano | findstr :5000`
- Kill the PID shown
- Restart server

---

## Testing with Multiple Users

1. **Create test accounts:**
   - User 1: testuser1@test.com
   - User 2: testuser2@test.com

2. **Test flow:**
   - Login as User 1
   - Create a post with image
   - Logout
   - Login as User 2
   - View User 1's post
   - Verify images load
   - Click message button on User 1's profile
   - Send a message
   - Login back as User 1
   - Check messages received

---

## Success Criteria

All tests pass when:
- ✅ No console errors
- ✅ All images load correctly
- ✅ Delete functionality works as expected
- ✅ Messaging works from both entry points
- ✅ UI updates smoothly
- ✅ No broken features from before
