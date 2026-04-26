# 🔧 دليل الدمج التفصيلي - Integration Guide

طرق دمج Chat Widget في متجرك الإلكتروني

---

## 🎯 **للمبرمجين**

### **1. التضمين المباشر في HTML**

#### **الخطوة 1: نسخ الملفات**

ضع الملفات في مجلد `assets` أو `public`:

```
your-website/
├── assets/
│   ├── chat-widget.css
│   ├── chat-widget.js
│   └── chat-widget.html
```

#### **الخطوة 2: إضافة الكود في صفحتك**

في `<head>`:

```html
<link rel="stylesheet" href="/assets/chat-widget.css">
```

قبل `</body>`:

```html
<!-- نسخ كامل HTML من ملف widget -->
<div id="chat-widget-container" class="chat-widget-container">
    <!-- المحتوى هنا -->
</div>

<script src="/assets/chat-widget.js"></script>
```

---

### **2. WordPress Integration**

#### **الطريقة 1: إضافة في Theme**

في `functions.php`:

```php
function add_chat_widget() {
    wp_enqueue_style('chat-widget', get_template_directory_uri() . '/assets/chat-widget.css');
    wp_enqueue_script('chat-widget', get_template_directory_uri() . '/assets/chat-widget.js', array(), '1.0', true);
}
add_action('wp_enqueue_scripts', 'add_chat_widget');
```

في `footer.php`:

```php
<?php 
// نسخ كامل HTML هنا
?>
```

#### **الطريقة 2: إنشاء Plugin**

```php
<?php
/*
Plugin Name: Chat Widget
Description: واجهة شات للمتجر
Version: 1.0
*/

function chat_widget_enqueue_assets() {
    wp_enqueue_style('chat-widget', plugins_url('style.css', __FILE__));
    wp_enqueue_script('chat-widget', plugins_url('script.js', __FILE__), array(), '1.0', true);
}
add_action('wp_enqueue_scripts', 'chat_widget_enqueue_assets');

function chat_widget_render() {
    include plugin_dir_path(__FILE__) . 'widget.html';
}
add_action('wp_footer', 'chat_widget_render');
?>
```

---

### **3. WooCommerce Integration**

في `functions.php`:

```php
// إضافة Widget في صفحة المنتج
add_action('woocommerce_after_single_product', 'add_chat_widget_product');

function add_chat_widget_product() {
    // نسخ HTML هنا
}

// تخصيص Widget حسب المنتج
add_action('wp_footer', function() {
    if (is_product()) {
        global $product;
        ?>
        <script>
        ChatWidget.setStoreInfo(
            '<?php echo get_bloginfo('name'); ?>', 
            '<?php echo get_site_icon_url(); ?>'
        );
        </script>
        <?php
    }
});
```

---

### **4. Shopify Integration**

في `theme.liquid`:

```liquid
<!-- في <head> -->
{{ 'chat-widget.css' | asset_url | stylesheet_tag }}

<!-- قبل </body> -->
<div id="chat-widget-container" class="chat-widget-container">
    <!-- HTML -->
</div>

{{ 'chat-widget.js' | asset_url | script_tag }}

<script>
ChatWidget.setStoreInfo(
    '{{ shop.name }}',
    '{{ shop.logo | img_url }}'
);
</script>
```

---

### **5. Laravel Integration**

#### **في `resources/views/layouts/app.blade.php`:**

```blade
<!DOCTYPE html>
<html>
<head>
    @vite(['resources/css/chat-widget.css'])
</head>
<body>
    @yield('content')
    
    @include('partials.chat-widget')
    
    @vite(['resources/js/chat-widget.js'])
    
    <script>
        ChatWidget.setStoreInfo(
            '{{ config('app.name') }}',
            '{{ asset('images/logo.png') }}'
        );
        ChatWidget.setAPI(
            '{{ route('api.chat') }}',
            '{{ auth()->user()->api_token ?? '' }}'
        );
    </script>
</body>
</html>
```

#### **API Route في `routes/api.php`:**

```php
Route::post('/chat', [ChatController::class, 'store']);
Route::post('/chat/rating', [ChatController::class, 'rating']);
```

#### **ChatController.php:**

```php
<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class ChatController extends Controller
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            'message' => 'required|string',
            'attachment' => 'nullable|array',
        ]);
        
        // حفظ في Database
        // إرسال إلى AI/Bot
        // إرجاع رد
        
        return response()->json([
            'success' => true,
            'response' => 'رد تلقائي من الخادم'
        ]);
    }
    
    public function rating(Request $request)
    {
        $validated = $request->validate([
            'rating' => 'required|integer|min:1|max:5',
            'feedback' => 'nullable|string',
        ]);
        
        // حفظ التقييم
        
        return response()->json(['success' => true]);
    }
}
```

---

### **6. React Integration**

```jsx
import { useEffect } from 'react';

function App() {
    useEffect(() => {
        // تحميل CSS
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = '/chat-widget.css';
        document.head.appendChild(link);
        
        // تحميل JS
        const script = document.createElement('script');
        script.src = '/chat-widget.js';
        script.async = true;
        document.body.appendChild(script);
        
        script.onload = () => {
            window.ChatWidget.setStoreInfo('متجري', '/logo.png');
            window.ChatWidget.setAPI('/api/chat', 'token');
        };
        
        return () => {
            document.head.removeChild(link);
            document.body.removeChild(script);
        };
    }, []);
    
    return <div>Your App</div>;
}
```

---

### **7. Vue.js Integration**

```vue
<template>
    <div id="app">
        <!-- Your content -->
    </div>
</template>

<script>
export default {
    mounted() {
        // تحميل Widget
        this.loadChatWidget();
    },
    methods: {
        loadChatWidget() {
            // CSS
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = '/chat-widget.css';
            document.head.appendChild(link);
            
            // HTML (يمكن استخدام v-html)
            const widgetContainer = document.createElement('div');
            widgetContainer.id = 'chat-widget-container';
            // ... add HTML
            document.body.appendChild(widgetContainer);
            
            // JS
            const script = document.createElement('script');
            script.src = '/chat-widget.js';
            document.body.appendChild(script);
        }
    }
}
</script>
```

---

## 🔗 **API Backend Examples**

### **Node.js + Express**

```javascript
const express = require('express');
const app = express();

app.use(express.json());

// استقبال رسائل
app.post('/api/chat', async (req, res) => {
    const { message, attachment, timestamp } = req.body;
    
    // حفظ في Database
    // معالجة بـ AI/Chatbot
    
    res.json({
        success: true,
        response: 'شكراً لرسالتك!'
    });
});

// استقبال تقييمات
app.post('/api/chat/rating', async (req, res) => {
    const { rating, feedback } = req.body;
    
    // حفظ التقييم
    
    res.json({ success: true });
});

app.listen(3000);
```

### **Python + Flask**

```python
from flask import Flask, request, jsonify

app = Flask(__name__)

@app.route('/api/chat', methods=['POST'])
def chat():
    data = request.get_json()
    message = data.get('message')
    
    # حفظ ومعالجة
    
    return jsonify({
        'success': True,
        'response': 'رد تلقائي'
    })

@app.route('/api/chat/rating', methods=['POST'])
def rating():
    data = request.get_json()
    rating = data.get('rating')
    feedback = data.get('feedback')
    
    # حفظ التقييم
    
    return jsonify({'success': True})

if __name__ == '__main__':
    app.run()
```

### **PHP Pure**

```php
<?php
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    
    if (isset($data['message'])) {
        // حفظ الرسالة
        $message = $data['message'];
        
        // رد تلقائي
        echo json_encode([
            'success' => true,
            'response' => 'شكراً لتواصلك معنا!'
        ]);
    }
    
    if (isset($data['rating'])) {
        // حفظ التقييم
        $rating = $data['rating'];
        $feedback = $data['feedback'] ?? '';
        
        echo json_encode(['success' => true]);
    }
}
?>
```

---

## 📊 **Database Schema (SQL)**

```sql
-- جدول المحادثات
CREATE TABLE chat_messages (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(255),
    message TEXT,
    sender ENUM('store', 'customer'),
    attachment_type VARCHAR(50),
    attachment_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- جدول التقييمات
CREATE TABLE chat_ratings (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(255),
    rating INT CHECK (rating BETWEEN 1 AND 5),
    feedback TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- فهرسة
CREATE INDEX idx_user_id ON chat_messages(user_id);
CREATE INDEX idx_created_at ON chat_messages(created_at);
```

---

## 🎨 **تخصيص الألوان من لوحة التحكم**

### **مثال: نظام Admin Panel**

```html
<!-- صفحة الإعدادات -->
<form id="theme-settings">
    <select id="theme-selector">
        <option value="0">أبيض كلاسيكي</option>
        <option value="1">أسود أنيق</option>
        <option value="2">ذهبي فاخر</option>
        <option value="3">أزرق سماوي</option>
        <option value="4">أزرق داكن</option>
        <option value="5">أحمر قوي</option>
        <option value="6">واتساب</option>
    </select>
    <button type="submit">حفظ</button>
</form>

<script>
document.getElementById('theme-settings').onsubmit = async (e) => {
    e.preventDefault();
    const theme = document.getElementById('theme-selector').value;
    
    // حفظ في Database
    await fetch('/api/settings/theme', {
        method: 'POST',
        body: JSON.stringify({ theme }),
        headers: {'Content-Type': 'application/json'}
    });
    
    alert('تم حفظ الثيم!');
};
</script>
```

**في صفحة المتجر:**

```php
<?php
// جلب الثيم من Database
$theme = get_store_theme(); // 0-6
?>

<script>
window.addEventListener('load', function() {
    ChatWidget.setTheme(<?php echo $theme; ?>);
});
</script>
```

---

## 🔐 **الأمان (Security)**

### **1. حماية API:**

```javascript
// في script.js - إضافة CSRF Token
fetch(CONFIG.apiEndpoint, {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': document.querySelector('meta[name="csrf-token"]').content
    },
    body: JSON.stringify(data)
});
```

### **2. تحقق من الملفات:**

```javascript
// في handleFileSelect
const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'];
const maxSize = 5 * 1024 * 1024; // 5MB

if (!allowedTypes.includes(file.type)) {
    alert('نوع الملف غير مسموح');
    return;
}

if (file.size > maxSize) {
    alert('حجم الملف كبير جداً');
    return;
}
```

---

## ✅ **Checklist قبل النشر**

- [ ] اختبار على جميع المتصفحات
- [ ] اختبار على الجوال والتابلت
- [ ] التأكد من عزل CSS
- [ ] ربط API
- [ ] تفعيل الثيم المناسب
- [ ] اختبار إرفاق الملفات
- [ ] اختبار نظام التقييم
- [ ] تحسين الأداء (Minify CSS/JS)

---

**🎉 جاهز للنشر!**
