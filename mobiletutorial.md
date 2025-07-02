# Mobile Tutorial Implementation Plan

## **Mobile Tutorial Step Analysis**

### **✅ Steps That Work Well As-Is**
These steps should work perfectly on mobile with minimal changes:

**1. `welcome-on-marketplace`**
- ✅ Center modal works great on mobile
- ✅ Dark overlay provides good focus

**3. `login-completion`** 
- ✅ Center modal with transparent overlay
- ✅ Perfect for mobile

**8. `select-payment-method`**
- ✅ Dialog-based, inherently mobile-friendly
- ✅ Left placement should work in dialog context

**9. `add-funds-dialog-opened`**
- ✅ Dialog-based interaction
- ✅ Left placement works within dialog

**10. `deposit-confirmation`**
- ✅ Center modal with transparent overlay
- ✅ Perfect for mobile

**17. `purchase-completion`**
- ✅ Center modal works universally
- ✅ No changes needed

**18. `tutorial-complete`**
- ✅ Center modal with dark overlay
- ✅ Perfect ending experience

---

### **🔄 Steps Needing Mobile Adaptations**

**2. `login-prompt`**
- **Current**: `promptPlacement: 'bottom-end'`
- **Mobile**: `promptPlacement: 'bottom'` (center bottom for better mobile UX)
- **Reason**: `bottom-end` may overflow on narrow screens

**4. `portfolio-navigation`** ⚠️ **Major Mobile Challenge**
- **Current**: Targets `[data-tutorial-id="portfolio-link"]` in sidebar
- **Mobile Issue**: Sidebar is hidden, portfolio link is in hamburger menu
- **Solution**: 
  - Mobile: First target hamburger menu button to open it
  - Then target portfolio link within opened menu
  - Or target mobile portfolio widget on marketplace page

**5. `portfolio-overview`**
- **Current**: `promptPlacement: 'left'`
- **Mobile**: `promptPlacement: 'top'` or `bottom`
- **Reason**: No space for left placement on mobile

**6. `portfolio-stats-summary-highlight`**
- **Current**: `promptPlacement: 'left'`
- **Mobile**: `promptPlacement: 'bottom'`
- **Reason**: Stats summary spans full width on mobile

**7. `add-funds-button`**
- **Current**: `promptPlacement: 'right'`
- **Mobile**: `promptPlacement: 'top'` or `bottom`
- **Reason**: Right placement may not fit on narrow screens

**11. `marketplace-navigation`** ⚠️ **Major Mobile Challenge**
- **Current**: Targets `[data-tutorial-id="marketplace-link"]` in sidebar
- **Mobile Issue**: Same as portfolio-navigation
- **Solution**: Target hamburger menu → marketplace link, or skip if already on marketplace

**12. `coin-selection-prompt`**
- **Current**: `promptPlacement: 'top'`
- **Mobile**: `promptPlacement: 'bottom'` 
- **Reason**: Mobile grid starts higher, bottom placement more natural

**13. `coin-detail-overview`**
- **Current**: `promptPlacement: 'right'`
- **Mobile**: `promptPlacement: 'bottom'`
- **Reason**: Order book takes full width on mobile

**14. `coin-history-tab-highlight`**
- **Current**: `promptPlacement: 'right'`
- **Mobile**: `promptPlacement: 'bottom'`
- **Reason**: History content spans full width

**15. `coin-details-tab-highlight`**
- **Current**: `promptPlacement: 'right'`  
- **Mobile**: `promptPlacement: 'bottom'`
- **Reason**: Details content spans full width

**16. `purchase-widget-highlight`**
- **Current**: `promptPlacement: 'left'`
- **Mobile**: `promptPlacement: 'top'`
- **Reason**: Purchase widget may be full width on mobile

---

## **Key Mobile Adaptation Patterns**

### **Prompt Placement Conversions**
```typescript
// Desktop → Mobile placement mapping
'left' → 'top' | 'bottom'     // No side space on mobile
'right' → 'top' | 'bottom'    // No side space on mobile  
'bottom-end' → 'bottom'       // Prevent overflow
'center' → 'center'           // Works universally
```

### **Critical Mobile Navigation Issues**
**Portfolio Navigation & Marketplace Navigation** need special handling:

**Option A: Hamburger Menu Flow**
```typescript
// Step 4a: Open hamburger menu (mobile only)
// Step 4b: Click portfolio link in menu
```

**Option B: Alternative Mobile Flow**
```typescript
// Skip sidebar navigation on mobile
// Use mobile portfolio widget on marketplace instead
```

### **Mobile-Specific Considerations**

**Touch Targets**:
- Increase `spotlightPadding` on mobile (12px → 16px)
- Ensure buttons are 44px minimum

**Content Length**:
- Some step content may need mobile-shortened versions
- Consider character limits for narrow screens

**Z-Index Management**:
- Mobile navigation menus may need higher z-index overrides
- Dialog stacking may behave differently

## **Implementation Strategy**

### **Phase 1: Add Mobile Detection Properties**
```typescript
interface TutorialStep {
  // ... existing properties
  mobilePromptPlacement?: PromptPlacement;
  mobileContent?: string;
  mobileSpotlightPadding?: number;
  mobileTargetSelector?: string; // For different mobile elements
}
```

### **Phase 2: Critical Steps to Address First**
1. **`portfolio-navigation`** - Most complex mobile challenge
2. **`marketplace-navigation`** - Similar navigation issue  
3. **Prompt placement adjustments** - Quick wins for UX

### **Phase 3: Mobile Flow Alternatives**
Consider mobile-specific tutorial flow that:
- Uses mobile portfolio widget instead of sidebar navigation
- Leverages hamburger menu interactions
- Optimizes for thumb-friendly interactions

## **Technical Implementation Plan**

### **Option 1: Responsive Tutorial Steps (Recommended)**
- Enhance existing tutorial config with mobile variants
- Use CSS breakpoint detection in tutorial provider
- Same tutorial flow, adaptive presentation

### **Option 2: Conditional Step Modifications**
- Modify steps at runtime based on viewport
- Keep single config file
- Dynamic prompt placement switching

### **Option 3: Mobile Step Overrides**
- Create mobile-specific overrides for problematic steps
- Minimal config duplication
- Clean separation of concerns

## **Key Technical Decisions**

1. **Keep existing tutorial flow** - same logical progression
2. **Responsive prompts** - adapt placement and sizing for mobile
3. **Touch optimization** - larger targets, better spacing
4. **Viewport detection** - use same breakpoints as your design system
5. **Progressive enhancement** - graceful degradation if mobile detection fails

## **Immediate Next Steps**

1. **Enhance tutorial provider** with mobile viewport detection
2. **Add mobile prompt placements** to existing tutorial steps
3. **Test critical steps** on mobile (login, navigation, purchase flow)
4. **Optimize overlay system** for touch devices 