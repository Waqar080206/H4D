# Mobile Overlay Testing Guide - 80-85% Screen Height

**Purpose**: Validate that mobile overlay panels display at 85vh height on all device sizes  
**Last Updated**: January 4, 2026

---

## 🧪 Quick Test Checklist

### Desktop Testing (Chrome DevTools)

#### **Test 1: Extra Small (<480px)**
```
Steps:
1. Open DevTools (F12)
2. Click Device Toolbar (Ctrl+Shift+M)
3. Set device to "iPhone 12" or "Mobile S"
4. Viewport: 375×667

Expected Behavior:
- Tap ☰ (menu button) → Sidebar slides from TOP
  - Height: 85vh = ~566px (on 667px viewport)
  - Width: 100%
  - Rounded bottom corners (20px)
  - Blue gradient background
  
- Tap ⓘ (details button) → Panel slides from BOTTOM
  - Height: 85vh = ~566px
  - Width: 100%
  - Rounded top corners (24px)
  - Orange gradient background
  
- Tap overlay (dark background) → Both panels close
- Only one panel visible at a time
- FAB buttons remain visible
  - Menu: 60px × 60px, bottom: 72px, left: 1rem
  - Details: 60px × 60px, bottom: 1rem, right: 1rem
```

#### **Test 2: Small (480-768px)**
```
Steps:
1. Set device to "iPad Mini" or similar
2. Viewport: 540×720

Expected Behavior:
- Sidebar slides from LEFT
  - Height: 85vh = ~612px
  - Width: 85% = ~459px
  - Rounded right corners (20px)
  
- Details panel slides from BOTTOM
  - Height: 85vh = ~612px
  - Width: 100%
  - Rounded top corners (24px)
  
- Same panel behavior as extra small
- Overlay still functional
- Same FAB sizing (54px × 54px on tablets)
```

#### **Test 3: Tablet (769px+)**
```
Steps:
1. Set device to "iPad Pro" or full desktop
2. Viewport: >1024px

Expected Behavior:
- Sidebar visible on LEFT side (no overlay)
- Details panel visible on RIGHT side (or modal)
- FABs hidden completely
- No mobile overlay present
- Can see both panels simultaneously
```

---

## 📱 Real Device Testing

### **Android Phone Testing**

#### Setup
```bash
1. Connect Android phone to computer
2. Enable USB Debugging
3. Open Chrome on phone
4. Navigate to http://[your-ip]:8000 or localhost:3000
```

#### Test on Actual Android Device
```
Device: Samsung Galaxy A12 (or similar)
Resolution: 1080×2300 (physical)
            384×854 (logical)

Steps:
1. Load dashboard
2. Verify header is readable
3. Tap ☰ button
   - Sidebar should slide from top
   - Takes 85% of screen height
   - Rounded bottom visible
   - Can scroll content inside

4. Tap ⓘ button
   - Sidebar closes
   - Details panel slides from bottom
   - Takes 85% of screen height
   - Rounded top visible
   - Can scroll content

5. Scroll within panels
   - Should scroll only the panel content
   - Body should NOT scroll
   
6. Try on landscape mode
   - Should adjust to landscape viewport
   - Still maintain 85vh height
```

### **iPhone Testing**

#### Setup (via Safari)
```
Device: iPhone 12/13/14 (or simulator)
Resolution: 1170×2532 (physical)
            390×844 (logical)

Steps:
1. Load dashboard in Safari
2. Test same as Android above
3. Check iOS-specific behaviors:
   - Notch/safe area handling
   - Home indicator doesn't interfere
   - Virtual keyboard doesn't break layout
```

### **Tablet Testing**

#### iPad Testing
```
Device: iPad Pro 12.9" or iPad Air
Resolution: 2732×2048 (physical)
            1024×768 (logical, split view)

Steps:
1. Load dashboard
2. Verify sidebar visible on left
3. Verify details visible on right
4. FABs should be hidden
5. Test in split-view mode
6. Test in landscape and portrait
```

---

## 🔍 Measurement Guide

### How to Measure 85vh

#### On Desktop (DevTools)
```javascript
// Open Console (F12 → Console tab)
// Paste this:

// Get actual viewport height
const vh = window.innerHeight;
console.log('Viewport Height:', vh + 'px');

// Calculate 85vh
const panel85vh = vh * 0.85;
console.log('85vh should equal:', panel85vh + 'px');

// Measure actual panel height
const panel = document.getElementById('detailsPanel');
const panelHeight = panel.offsetHeight;
console.log('Actual panel height:', panelHeight + 'px');

// Check if they match
if (Math.abs(panelHeight - panel85vh) < 5) {
    console.log('✅ PASS: Panel height is correct (85vh)');
} else {
    console.log('❌ FAIL: Panel height mismatch');
    console.log('Expected:', panel85vh + 'px');
    console.log('Got:', panelHeight + 'px');
}
```

#### Visual Measurement Checklist
```
On Mobile (Extra Small < 480px):
- [ ] Sidebar height: 85% of screen (measure from top)
- [ ] Details height: 85% of screen (measure from bottom)
- [ ] Top 15% of screen visible when sidebar open
- [ ] Bottom 15% of screen visible when details open
- [ ] Both panels have rounded corners
- [ ] Overlay is dark (not pure black)

On Tablet (480px - 768px):
- [ ] Sidebar height: 85% of screen
- [ ] Details height: 85% of screen
- [ ] Measurements same as mobile
- [ ] Sidebar width: 85%
- [ ] Details width: 100%

On Desktop (769px+):
- [ ] Panels NOT overlays
- [ ] Sidebar always visible
- [ ] Details always visible (or modal)
- [ ] Full layout visible simultaneously
```

---

## 🎬 Animation Testing

### Sidebar Animation
```
Trigger: Click ☰ button

Animation Properties:
- Duration: 0.3 seconds
- Easing: ease (smooth)
- Direction: Slide from TOP (mobile) or LEFT (tablet)

Test:
1. Click menu button
2. Watch sidebar slide smoothly
3. Should NOT be instant (0.3s visible)
4. Should NOT be jerky (ease easing)
5. Overlay should fade in simultaneously
6. Should stop at exact position (no overshoot)
```

### Details Panel Animation
```
Trigger: Click ⓘ button

Animation Properties:
- Duration: 0.3 seconds
- Easing: ease (smooth)
- Direction: Slide from BOTTOM

Test:
1. Click details button
2. Watch panel slide smoothly from bottom
3. Should reach 85vh position (15% visible at bottom)
4. Overlay should fade in simultaneously
5. Should be smooth and fluid
```

### Close Animation
```
Trigger: Click overlay or close button

Animation Properties:
- Duration: 0.3 seconds
- Direction: Reverse (slide back out)

Test:
1. Open panel
2. Click overlay to close
3. Panel should slide back smoothly
4. Overlay should fade out
5. Both should complete at same time
```

---

## 📊 Visual Testing Checklist

### Layout Elements
- [ ] Header visible and readable
- [ ] Title: "Monsoon Risk Dashboard – Delhi"
- [ ] Rainfall value displays correctly
- [ ] Weather status shows (Rainy/Cloudy/Clear)
- [ ] Last updated timestamp shows

### Sidebar (Menu)
- [ ] "Rainfall Scenario" section visible
- [ ] 5 buttons visible: Real-Time, Light, Moderate, Heavy, Extreme
- [ ] Ward list shows all wards
- [ ] Risk summary shows: HIGH, MEDIUM, LOW counts
- [ ] Colors are correct: Red, Orange, Green
- [ ] Text is readable

### Details Panel
- [ ] Ward name displays
- [ ] Risk assessment shows
- [ ] Preparedness score visible
- [ ] Historical data displayed
- [ ] Hotspots list shows
- [ ] Recommended actions list visible
- [ ] Drag handle indicator visible (small bar at top)
- [ ] Close button (✕) visible in top right

### Map
- [ ] Leaflet map displays correctly
- [ ] Ward markers visible
- [ ] Markers change color based on risk level
- [ ] Click marker opens details panel
- [ ] Zoom and pan work
- [ ] Full width available on mobile

### Floating Action Buttons
- [ ] ☰ button: Blue gradient, 60px × 60px on mobile
- [ ] ⓘ button: Orange gradient, 60px × 60px on mobile
- [ ] Both at bottom of screen
- [ ] Menu at 72px from bottom
- [ ] Details at 16px from bottom
- [ ] Both have shadows
- [ ] Both are clickable/tappable

### Overlay
- [ ] Dark background behind panels
- [ ] 70% opacity (semi-transparent)
- [ ] Can see map through it
- [ ] Has slight blur effect
- [ ] Clicking closes panels

---

## 🔧 Debug Commands

### In Browser Console
```javascript
// Check if panels have correct height
console.log('Sidebar height:', document.getElementById('sidebar').style.height);
console.log('Details height:', document.getElementById('detailsPanel').style.height);

// Check viewport dimensions
console.log('Window height:', window.innerHeight);
console.log('85vh in px:', window.innerHeight * 0.85);

// Check if classes are being applied
console.log('Sidebar classes:', document.getElementById('sidebar').className);
console.log('Details classes:', document.getElementById('detailsPanel').className);

// Check computed styles
const sidebar = document.getElementById('sidebar');
console.log('Computed height:', getComputedStyle(sidebar).height);

// Force measurement
const sidebarRect = sidebar.getBoundingClientRect();
console.log('Sidebar rect:', sidebarRect);
console.log('Sidebar height from rect:', sidebarRect.height);
```

### Check CSS Media Queries
```javascript
// Check which media query is active
const mediaQuery = window.matchMedia('(max-width: 479px)');
console.log('Extra Small active:', mediaQuery.matches);

const mediaQuery2 = window.matchMedia('(min-width: 480px) and (max-width: 768px)');
console.log('Small active:', mediaQuery2.matches);

const mediaQuery3 = window.matchMedia('(min-width: 769px)');
console.log('Tablet+ active:', mediaQuery3.matches);
```

---

## ✅ Successful Implementation Indicators

### ✅ Panel Height
```
Sidebar height = 85vh ✓
Details height = 85vh ✓
```

### ✅ Panel Width
```
Extra Small:
  Sidebar: 100% ✓
  Details: 100% ✓

Small (480-768px):
  Sidebar: 85% ✓
  Details: 100% ✓

Tablet+:
  Sidebar: Always visible ✓
  Details: Always visible ✓
```

### ✅ Animation
```
Slide duration: 0.3s ✓
Easing: ease ✓
Overlay fade: 0.3s ✓
Smooth transitions ✓
```

### ✅ Responsiveness
```
Mobile: Works ✓
Tablet: Works ✓
Desktop: Works ✓
Landscape: Works ✓
Portrait: Works ✓
```

### ✅ Accessibility
```
Touch targets: 44px+ ✓
Button size: 60px ✓
Readable text ✓
High contrast ✓
Aria labels ✓
```

---

## 🐛 Common Issues & Solutions

### Issue 1: Panel Takes 100vh (Full Screen)
**Problem**: Panel covers header and extends beyond screen

**Solution**:
```css
/* Check that height is set to 85vh, not 100vh */
.details-panel {
    height: 85vh;  /* NOT 100vh */
}
```

### Issue 2: Panel Not Visible on Mobile
**Problem**: Panel opens but can't be seen

**Solution**:
```javascript
// Check z-index values in DevTools
// Sidebar should have z-index: 100
// Details should have z-index: 99
// Overlay should have z-index: 98

// Check if panel has active class
console.log(document.getElementById('detailsPanel').classList);
// Should show: "details-panel active"
```

### Issue 3: Panel Doesn't Slide Smoothly
**Problem**: Panel appears/disappears instantly

**Solution**:
```css
/* Check transition property */
.details-panel {
    transition: bottom 0.3s ease;  /* Required */
}

.sidebar {
    transition: left 0.3s ease;  /* Required */
}
```

### Issue 4: Header Covered by Sidebar
**Problem**: Sidebar covers header area

**Solution**:
```css
/* Sidebar should start from below header */
.sidebar {
    top: 0;  /* This is correct for fixed positioning */
    /* OR use top: 70px if header height is 70px */
}
```

### Issue 5: Overflow/Scrolling Issues
**Problem**: Content inside panel doesn't scroll properly

**Solution**:
```javascript
// Make sure body scroll is prevented when overlay active
document.body.classList.add('overlay-active');

// In CSS:
body.overlay-active {
    overflow: hidden;
}
```

---

## 📋 Test Report Template

```
Test Date: _______________
Tester: ___________________
Device: ___________________
Resolution: _______________
Browser: __________________

EXTRA SMALL (<480px)
- Sidebar height correct: ☐ PASS ☐ FAIL
- Sidebar animation smooth: ☐ PASS ☐ FAIL
- Details height correct: ☐ PASS ☐ FAIL
- Details animation smooth: ☐ PASS ☐ FAIL
- Only one panel visible: ☐ PASS ☐ FAIL
- Overlay works: ☐ PASS ☐ FAIL
- FAB buttons functional: ☐ PASS ☐ FAIL

SMALL (480-768px)
- Sidebar width 85%: ☐ PASS ☐ FAIL
- Details width 100%: ☐ PASS ☐ FAIL
- Heights 85vh: ☐ PASS ☐ FAIL
- Animations smooth: ☐ PASS ☐ FAIL

TABLET+ (769px+)
- Sidebar always visible: ☐ PASS ☐ FAIL
- Details always visible: ☐ PASS ☐ FAIL
- FABs hidden: ☐ PASS ☐ FAIL
- Full layout visible: ☐ PASS ☐ FAIL

OVERALL
- Mobile responsive: ☐ PASS ☐ FAIL
- Touch-friendly: ☐ PASS ☐ FAIL
- Accessible: ☐ PASS ☐ FAIL
- No layout issues: ☐ PASS ☐ FAIL

Notes:
_________________________________
_________________________________
```

---

## 🚀 Final Verification

Run this in console before deployment:

```javascript
// Comprehensive test script
console.log('=== MOBILE OVERLAY VERIFICATION ===');

// Test 1: Check CSS heights
const sidebar = document.getElementById('sidebar');
const details = document.getElementById('detailsPanel');

console.log('✓ Sidebar element exists:', !!sidebar);
console.log('✓ Details element exists:', !!details);

// Test 2: Check if media queries work
const isMobile = window.matchMedia('(max-width: 479px)').matches;
console.log('Mobile layout active:', isMobile);

// Test 3: Check animations
const sidebarStyle = getComputedStyle(sidebar);
console.log('Sidebar transition:', sidebarStyle.transition);

// Test 4: Check z-index layering
console.log('Sidebar z-index:', getComputedStyle(sidebar).zIndex);
console.log('Details z-index:', getComputedStyle(details).zIndex);

// Test 5: Check viewport height
console.log('Viewport height:', window.innerHeight + 'px');
console.log('85vh = ', (window.innerHeight * 0.85) + 'px');

console.log('=== END VERIFICATION ===');
```

---

*Testing Guide Created: January 4, 2026*  
*Version: 1.0*  
*Mobile Overlay Height: 85% of Viewport (85vh)*
