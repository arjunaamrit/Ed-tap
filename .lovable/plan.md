
## Full-Screen Dynamic Document Reader

### Problem Identified
When a document is uploaded, the reader area is not utilizing the full viewport. The current implementation has:
1. Multiple nested padding layers reducing the available reading space
2. Fixed height calculations that don't properly account for all device sizes
3. The reader card styling adds unnecessary margins/shadows on mobile that waste screen space

### Solution Overview
Make the document viewer dynamically fill 100% of the available screen space (below the header) on all devices while maintaining comfortable, responsive padding.

---

### Technical Implementation

**File 1: `src/pages/DocumentReader.tsx`**

Changes to the document reading container (lines 729-769):
- Remove the outer padding from the main container on mobile
- Ensure the inner wrapper uses `w-full` with no max-width constraints
- Keep minimal padding on mobile, comfortable padding on larger screens
- Remove the document organizer section's margin that takes up space

```text
BEFORE:
<main className="flex-1 min-w-0 w-full overflow-auto p-0 sm:p-2 md:p-4 lg:p-6">
  <div className="w-full max-w-none">
    ...
  </div>
</main>

AFTER:
<main className="flex-1 min-w-0 w-full h-full overflow-auto">
  <div className="w-full h-full flex flex-col">
    ...
  </div>
</main>
```

**File 2: `src/components/reader/EnhancedDocumentViewer.tsx`**

Changes to the reader card container (line 309):
- Use dynamic viewport height: `min-h-[calc(100dvh-4rem)]` (subtracting header height)
- Remove card styling on mobile (no rounded corners, no shadow, no extra padding)
- Apply card styling only on larger screens
- Ensure the text fills the available width

```text
BEFORE:
className="reader-card w-full max-w-none rounded-none shadow-none 
           sm:rounded-xl sm:shadow-xl p-3 sm:p-6 lg:p-10 
           min-h-[calc(100dvh-64px-5rem)] reader-prose select-text cursor-text"

AFTER:
className="reader-card w-full h-full 
           rounded-none shadow-none p-4 
           sm:rounded-xl sm:shadow-lg sm:p-6 md:p-8 lg:p-10 
           min-h-[calc(100dvh-4rem)] reader-prose select-text cursor-text"
```

**File 3: `src/index.css`**

Update the `.reader-card` component class to ensure full-width behavior:
- Ensure it respects width constraints from parent
- Remove any implicit max-width

---

### Layout Structure (After Changes)

```text
+--------------------------------------------------+
|  HEADER (64px / 4rem)                            |
+--------------------------------------------------+
|                                                  |
|  DOCUMENT VIEWER                                 |
|  - Full width (edge to edge on mobile)           |
|  - Comfortable padding (16px mobile, 24-40px     |
|    on larger screens)                            |
|  - Full height (100dvh - header height)          |
|  - Scrollable content                            |
|                                                  |
+--------------------------------------------------+
```

### Device Behavior

| Device | Padding | Styling |
|--------|---------|---------|
| Mobile (<640px) | 16px (1rem) all sides | No rounded corners, no shadow |
| Tablet (640-1024px) | 24px (1.5rem) all sides | Rounded corners, subtle shadow |
| Desktop (>1024px) | 40px (2.5rem) all sides | Rounded corners, shadow |

---

### Summary of Changes

1. **DocumentReader.tsx**: Remove nested padding from the main container; let the viewer fill the entire available space
2. **EnhancedDocumentViewer.tsx**: Update the reader card to use full viewport height minus header, with responsive padding that doesn't waste space on mobile
3. **index.css**: Ensure reader-card styles support edge-to-edge display

These changes ensure the document text fills the entire screen dynamically on any device while maintaining readable padding.
