# 💬 Chat Widget - دليل الاستخدام الشامل

واجهة شات احترافية للمتاجر الإلكترونية - **HTML + CSS + JavaScript**

---

## 📦 **محتويات الملفات**

```
widget/
├── index.html      # الملف الرئيسي (مثال على الاستخدام)
├── style.css       # ملف التنسيقات (معزول تماماً)
├── script.js       # ملف البرمجة (Vanilla JavaScript)
└── README.md       # دليل الاستخدام
```

---

## 🚀 **طريقة التضمين في موقعك**

### **الطريقة 1: التضمين المباشر (Embed)**

أضف هذا الكود في نهاية صفحة HTML قبل `</body>`:

```html
<!-- Chat Widget CSS -->
<link rel="stylesheet" href="path/to/style.css">

<!-- Chat Widget HTML -->
<div id="chat-widget-container" class="chat-widget-container">
    <!-- نسخ كامل محتوى الـ Widget من index.html -->
</div>

<!-- Chat Widget JS -->
<script src="path/to/script.js"></script>
```

### **الطريقة 2: استخدام iframe (موصى به)**

```html
<iframe 
    src="path/to/index.html" 
    style="position: fixed; bottom: 20px; left: 20px; width: 400px; height: 600px; border: none; z-index: 9999;">
</iframe>
```

### **الطريقة 3: Script Tag (الأفضل)**

قريباً سيتم توفير ملف مدمج واحد:

```html
<script src="https://yourcdn.com/chat-widget.min.js"></script>
<script>
  ChatWidget.init({
    storeName: 'متجرك',
    storeLogo: 'logo.png',
    theme: 0
  });
</script>
```

---

## 🎨 **تغيير الثيم (7 ألوان)**

### **من JavaScript:**

افتح ملف `script.js` واعدل السطر:

```javascript
currentTheme: 0,  // غير الرقم من 0 إلى 6
```

### **الثيمات المتاحة:**

| الرقم | الاسم | الألوان |
|------|------|---------|
| 0 | أبيض كلاسيكي | #FFFFFF + Purple/Blue |
| 1 | أسود أنيق | #000000 + Dark Gray |
| 2 | ذهبي فاخر | #FFD700 + Orange |
| 3 | أزرق سماوي | #00BFFF + Sky Blue |
| 4 | أزرق داكن | #0A1F44 + Navy |
| 5 | أحمر قوي | #FF0000 + Red |
| 6 | واتساب | #25D366 + Green |

### **تغيير الثيم برمجياً:**

```javascript
ChatWidget.setTheme(6); // تغيير إلى ثيم واتساب
```

---

## ⚙️ **الإعدادات الأساسية**

### **تغيير معلومات المتجر:**

في `script.js`:

```javascript
const CONFIG = {
    storeName: 'اسم متجرك',
    storeLogo: 'رابط-شعار-المتجر.png',
    // ...
};
```

أو استخدم API:

```javascript
ChatWidget.setStoreInfo('متجر الهدايا', 'https://example.com/logo.png');
```

---

## 🔌 **ربط الـ Widget بالباك إند**

### **إعداد API:**

في `script.js`:

```javascript
const CONFIG = {
    apiEndpoint: 'https://api.yourstore.com/chat',
    apiKey: 'your-api-key-here'
};
```

أو استخدم:

```javascript
ChatWidget.setAPI('https://api.yourstore.com/chat', 'your-api-key');
```

### **طلبات API:**

**1. إرسال رسالة:**

```javascript
POST /chat
Headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_API_KEY'
}
Body: {
    message: "نص الرسالة",
    attachment: { ... },
    timestamp: "2026-04-12T..."
}
```

**2. إرسال تقييم:**

```javascript
POST /chat/rating
Body: {
    rating: 5,
    feedback: "خدمة ممتازة",
    timestamp: "2026-04-12T..."
}
```

---

## 🎯 **JavaScript API**

### **الوظائف المتاحة:**

```javascript
// فتح الشات
ChatWidget.open();

// إغلاق الشات
ChatWidget.close();

// تبديل (فتح/إغلاق)
ChatWidget.toggle();

// تغيير الثيم
ChatWidget.setTheme(3); // 0-6

// تعديل معلومات المتجر
ChatWidget.setStoreInfo('اسم المتجر', 'رابط الشعار');

// ربط API
ChatWidget.setAPI('https://api.example.com', 'api-key');

// الحصول على جميع الرسائل
const messages = ChatWidget.getMessages();

// مسح المحادثة
ChatWidget.clearMessages();
```

---

## 📱 **التجاوب (Responsive)**

التصميم متجاوب بالكامل:

- **Desktop**: 400×600px
- **Tablet**: 380×580px
- **Mobile**: Full screen

---

## 🔒 **عزل CSS (لا يؤثر على الموقع)**

جميع الـ classes تبدأ بـ `.chat-widget-*` لضمان عدم التعارض:

```css
.chat-widget-container { ... }
.chat-widget-header { ... }
.chat-widget-message { ... }
```

---

## ✨ **المميزات**

✅ **خفيف وسريع** - Vanilla JS (بدون مكتبات)
✅ **معزول بالكامل** - لا يتأثر بتصميم الموقع
✅ **7 ثيمات جاهزة** - قابلة للتخصيص
✅ **إرفاق الملفات** - صور ومستندات
✅ **RTL كامل** - دعم اللغة العربية
✅ **تقييم المحادثة** - نظام 5 نجوم
✅ **تحميل المحادثة** - حفظ كملف TXT
✅ **API جاهز** - سهل الربط بالباك إند

---

## 🛠️ **التخصيص المتقدم**

### **تغيير ألوان ثيم معين:**

في `style.css`:

```css
/* مثال: تعديل ثيم واتساب */
/* في script.js غير الألوان: */
{ 
    id: 'whatsapp', 
    gradientFrom: '#16a34a',  /* غير هذا */
    gradientTo: '#15803d'      /* وهذا */
}
```

### **تعديل زمن الرد التلقائي:**

في `script.js`:

```javascript
responseDelay: 1500  // بالميلي ثانية (1.5 ثانية)
```

---

## 📊 **دعم المتصفحات**

✅ Chrome 90+
✅ Firefox 88+
✅ Safari 14+
✅ Edge 90+
✅ Mobile Browsers

---

## 🆘 **المشاكل الشائعة**

### **المشكلة: الشات لا يظهر**

```javascript
// تأكد من:
1. تحميل الملفات بالترتيب الصحيح (CSS -> HTML -> JS)
2. وجود عنصر #chat-widget-container في HTML
3. عدم وجود أخطاء في Console
```

### **المشكلة: الثيم لا يتغير**

```javascript
// تأكد من:
1. تعديل الرقم في CONFIG.currentTheme
2. تحديث الصفحة (Ctrl+F5)
```

---

## 📞 **الدعم**

للمساعدة أو الاستفسارات:
- البريد الإلكتروني: support@yourstore.com
- التوثيق الكامل: https://docs.yourstore.com

---

## 📝 **الترخيص**

هذا المشروع متاح للاستخدام التجاري والشخصي.

---

**صُمم بـ ❤️ لأصحاب المتاجر الإلكترونية**
