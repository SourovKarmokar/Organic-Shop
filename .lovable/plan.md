

## 🌿 Organic Food E-commerce Frontend UI Plan

**Reference:** green.khaleditsolution.shop এর মতো সম্পূর্ণ Frontend UI তৈরি করা হবে। সব ডেটা এখন হার্ডকোড/mock থাকবে, পরে backend যোগ করা যাবে।

---

### Step 1: Theme & Layout Setup
- সবুজ (green) থিম কালার সেট করা — হেডার, বাটন, accent সব সবুজ
- Bengali/Bangla ফন্ট সাপোর্ট
- মোবাইল-ফ্রেন্ডলি responsive layout

### Step 2: Header ও Navigation
- উপরে ফোন নম্বর ব্যানার (01743839807) + স্ক্রলিং নোটিশ টেক্সট
- লোগো (Organic Shop), সার্চ বার, Track Order, Login/Sign Up, Cart আইকন
- ক্যাটাগরি নেভিগেশন বার: Ghee & Oil, Original Organic Honey, Nuts & Dates, Organic Spices, Organic Oil, Rice Pulse, Super Foods, Sweeteners & Dairy

### Step 3: Homepage
- **Hero Banner Slider** — প্রমোশনাল ইমেজ ক্যারোসেল (placeholder ইমেজ দিয়ে)
- **Top Categories** — বৃত্তাকার ইমেজ কার্ড সহ ক্যাটাগরি গ্রিড (8টি ক্যাটাগরি)
- **All Products** সেকশন — প্রোডাক্ট কার্ড গ্রিড (ডিসকাউন্ট ব্যাজ, আসল দাম, ছাড়ের দাম, "অর্ডার করুন" বাটন)
- **Category-wise Product Sections** — প্রতিটি ক্যাটাগরির প্রোডাক্ট আলাদা সেকশনে + "View More" লিংক
- **প্রমোশনাল ব্যানার** — মাঝে মাঝে বিজ্ঞাপন ব্যানার

### Step 4: Product Detail Page
- বড় প্রোডাক্ট ইমেজ + থাম্বনেইল
- ডিসকাউন্ট ব্যাজ, দাম (আসল + ছাড়), রেটিং, প্রোডাক্ট কোড, ব্র্যান্ড
- Quantity selector (+/-)
- "কার্টে যোগ করুন" ও "অর্ডার করুন" বাটন
- কল ও WhatsApp বাটন
- ডেলিভারি চার্জ টেবিল (ঢাকা ভিতরে/বাহিরে)
- Tabs: Description, Order Policy, Reviews

### Step 5: Category Page
- ক্যাটাগরি নাম হেডার
- ফিল্টার করা প্রোডাক্ট গ্রিড (সেই ক্যাটাগরির প্রোডাক্ট)

### Step 6: Cart & Checkout Page
- কার্টে থাকা প্রোডাক্ট লিস্ট (ইমেজ, নাম, দাম, quantity, মোট)
- কুপন কোড ইনপুট
- অর্ডার সামারি (সাবটোটাল, ডেলিভারি চার্জ, মোট)
- চেকআউট ফর্ম: নাম, ফোন, ঠিকানা, ডেলিভারি এলাকা সিলেক্ট
- পেমেন্ট মেথড: Cash on Delivery

### Step 7: Login/Sign Up ও Track Order Pages
- সিম্পল Login ফর্ম (ফোন/ইমেইল + পাসওয়ার্ড)
- Sign Up ফর্ম
- Track Order পেজ — অর্ডার আইডি দিয়ে ট্র্যাক করার ফর্ম

### Step 8: Footer ও WhatsApp Button
- Footer: ক্যাটাগরি লিংক, কন্টাক্ট ইনফো, সোশ্যাল মিডিয়া
- Floating WhatsApp বাটন (নিচে বামে)
- Mobile bottom navigation bar (Category, WhatsApp, Home, Cart, Login)

---

**⚠️ নোট:** সব ডেটা হার্ডকোড/mock হিসেবে থাকবে। পরে Supabase বা আপনার নিজের API/backend যোগ করে ডাইনামিক করা যাবে।

**🔢 আনুমানিক ক্রেডিট:** এটি একটি বড় প্রজেক্ট — সম্পূর্ণ করতে ১৫-২৫+ মেসেজ লাগতে পারে। ধাপে ধাপে implement করা হবে।

