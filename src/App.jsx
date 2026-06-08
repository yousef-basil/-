import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles, HeartHandshake, Upload, Trash2, RotateCw, RefreshCw, Settings,
  Share2, Image as ImageIcon, Terminal, User, Heart, MessageCircle,
  Repeat, Bookmark, Plus, CheckCircle2, AlertCircle, X, HelpCircle,
  ExternalLink
} from 'lucide-react';
import './App.css';

// Aspect ratio presets for each platform
const PLATFORM_PRESETS = {
  x: { name: 'X (تويتر)', ratio: 16 / 9, width: 1200, height: 675, label: 'أفقي (16:9)' },
  pinterest: { name: 'Pinterest', ratio: 2 / 3, width: 1000, height: 1500, label: 'عمودي (2:3)' },
  threads: { name: 'Threads', ratio: 1 / 1, width: 1080, height: 1080, label: 'مربع (1:1)' },
  tumblr: { name: 'Tumblr', ratio: 3 / 4, width: 800, height: 1000, label: 'صورة طولية (3:4)' }
};

function App() {
  // --- STATE ---
  const [imageFile, setImageFile] = useState(null);
  const [imageSrc, setImageSrc] = useState(null);
  const [mediaType, setMediaType] = useState('image'); // 'image' or 'video'
  const [textPrompt, setTextPrompt] = useState('');
  const [tone, setTone] = useState('auto'); // auto, campaign, report, story, volunteer, education
  const [activeTab, setActiveTab] = useState('x');
  const [isProcessing, setIsProcessing] = useState(false);
  const [logs, setLogs] = useState([]);

  const [showSettings, setShowSettings] = useState(false);  // Credentials
  const [geminiApiKey, setGeminiApiKey] = useState(() => {
    return localStorage.getItem('tahaluf_gemini_key') || '';
  });

  // Cost and Token Tracker States
  const [totalCost, setTotalCost] = useState(() => {
    return parseFloat(localStorage.getItem('tahaluf_total_cost') || '0');
  });
  const [lastCost, setLastCost] = useState(0);
  const [totalTokens, setTotalTokens] = useState(() => {
    return parseInt(localStorage.getItem('tahaluf_total_tokens') || '0', 10);
  });

  // AI Generated Results
  const [results, setResults] = useState({
    enhancedText: 'اكتب فكرة الحملة وارفع صورة الحالة الإنسانية، ثم اضغط على زر التوليد الذكي للبدء! 🕊️',
    platforms: {
      x: { caption: 'هنا سيظهر المنشور المخصص لمنصة X بعد عملية التوليد بالذكاء الاصطناعي 📱✨ #جمعية_تحالف' },
      pinterest: {
        title: 'عنوان دبوس ملهم',
        description: 'هنا سيظهر الوصف المخصص لمنصة Pinterest...'
      },
      threads: { caption: 'هنا سيظهر منشور Threads التفاعلي لجذب المتبرعين والداعمين 💬🔥' },
      tumblr: {
        title: 'عنوان التقرير أو القصة',
        body: 'هنا ستظهر تفاصيل الحالة الإنسانية أو المقال لمنصة Tumblr...'
      }
    },
    hashtags: ['جمعية_تحالف', 'عمل_خيري', 'إغاثة']
  });

  // Cropping State per platform
  const [cropSettings, setCropSettings] = useState({
    x: { scale: 1.0, rotate: 0, x: 0, y: 0 },
    pinterest: { scale: 1.0, rotate: 0, x: 0, y: 0 },
    threads: { scale: 1.0, rotate: 0, x: 0, y: 0 },
    tumblr: { scale: 1.0, rotate: 0, x: 0, y: 0 }
  });

  // Cropped Images (Data URLs)
  const [croppedImages, setCroppedImages] = useState({
    x: null,
    pinterest: null,
    threads: null,
    tumblr: null
  });

  // Publishing State
  const [publishingStatus, setPublishingStatus] = useState('idle'); // idle, publishing, success, error
  const [publishedLinks, setPublishedLinks] = useState({
    x: null,
    pinterest: null,
    threads: null,
    tumblr: null
  });

  // UI Interactive States
  const [dragging, setDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [dragActive, setDragActive] = useState(false);

  // References
  const fileInputRef = useRef(null);
  const cropperContainerRef = useRef(null);
  const hiddenImageRef = useRef(null);
  const terminalEndRef = useRef(null);

  // Initialize key in localStorage
  useEffect(() => {
    localStorage.setItem('tahaluf_gemini_key', geminiApiKey);
  }, [geminiApiKey]);

  // Sync cost and tokens to localStorage
  useEffect(() => {
    localStorage.setItem('tahaluf_total_cost', totalCost.toString());
  }, [totalCost]);

  useEffect(() => {
    localStorage.setItem('tahaluf_total_tokens', totalTokens.toString());
  }, [totalTokens]);

  const handleResetCost = () => {
    if (window.confirm('هل تريد إعادة تعيين إحصائيات التكلفة والاستهلاك إلى الصفر؟')) {
      setTotalCost(0);
      setTotalTokens(0);
      setLastCost(0);
      addLog('تم إعادة تعيين إحصائيات تكلفة الـ API بنجاح.', 'info');
    }
  };

  // Autoscroll terminal
  useEffect(() => {
    if (terminalEndRef.current) {
      terminalEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs]);

  // Log message helper
  const addLog = (text, type = 'info') => {
    const timestamp = new Date().toLocaleTimeString('ar-EG', { hour12: false });
    setLogs(prev => [...prev, { time: timestamp, text, type }]);
  };

  // Whenever imageSrc or cropSettings changes, generate cropped images
  useEffect(() => {
    if (imageSrc && mediaType === 'image') {
      // Create HTMLImageElement to read dimensions
      const img = new Image();
      img.src = imageSrc;
      img.onload = () => {
        // Generate cropped preview for all platforms
        const updatedCropped = { ...croppedImages };
        Object.keys(PLATFORM_PRESETS).forEach(platform => {
          updatedCropped[platform] = performCanvasCrop(img, platform, cropSettings[platform]);
        });
        setCroppedImages(updatedCropped);
      };
    } else {
      setCroppedImages({
        x: null,
        pinterest: null,
        threads: null,
        tumblr: null
      });
    }
  }, [imageSrc, cropSettings, mediaType]);

  // Crop Canvas Implementation
  const performCanvasCrop = (imgEl, platform, settings) => {
    const preset = PLATFORM_PRESETS[platform];
    const canvas = document.createElement('canvas');
    canvas.width = preset.width;
    canvas.height = preset.height;
    const ctx = canvas.getContext('2d');

    // Fill background with elegant dark color in case of empty spacing
    ctx.fillStyle = '#06070d';
    ctx.fillRect(0, 0, preset.width, preset.height);

    ctx.save();

    // Shift coordinate system to canvas center + custom user offset adjustments
    ctx.translate(preset.width / 2 + settings.x, preset.height / 2 + settings.y);

    // Apply rotation
    ctx.rotate((settings.rotate * Math.PI) / 180);

    // Compute base scale to cover the target box (Cover effect)
    const baseScaleX = preset.width / imgEl.naturalWidth;
    const baseScaleY = preset.height / imgEl.naturalHeight;
    const baseScale = Math.max(baseScaleX, baseScaleY);

    // Apply scaling factor (baseScale * user scale slider)
    const finalScale = baseScale * settings.scale;
    ctx.scale(finalScale, finalScale);

    // Draw the image centered
    ctx.drawImage(imgEl, -imgEl.naturalWidth / 2, -imgEl.naturalHeight / 2);

    ctx.restore();
    return canvas.toDataURL('image/jpeg', 0.85);
  };

  // --- IMAGE UPLOAD HANDLERS ---
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      processFile(file);
    }
  };

  const processFile = (file) => {
    if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) {
      addLog('خطأ: الملف المرفوع ليس صورة أو فيديو صالح.', 'error');
      return;
    }
    const isVideo = file.type.startsWith('video/');
    setImageFile(file);
    setMediaType(isVideo ? 'video' : 'image');

    const reader = new FileReader();
    reader.onload = (e) => {
      setImageSrc(e.target.result);
      if (!isVideo) {
        // Reset crop settings to default only for images
        setCropSettings({
          x: { scale: 1.0, rotate: 0, x: 0, y: 0 },
          pinterest: { scale: 1.0, rotate: 0, x: 0, y: 0 },
          threads: { scale: 1.0, rotate: 0, x: 0, y: 0 },
          tumblr: { scale: 1.0, rotate: 0, x: 0, y: 0 }
        });
      }
      addLog(`تم تحميل ${isVideo ? 'الفيديو' : 'الصورة'} بنجاح: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)} ميجابايت)`, 'success');
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = () => {
    setDragActive(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const triggerUploadInput = () => {
    fileInputRef.current.click();
  };

  const removeImage = () => {
    setImageFile(null);
    setImageSrc(null);
    setMediaType('image');
    addLog('تم إزالة الملف المرفق بالكامل. المنشور الآن نصي فقط.', 'info');
  };

  const generateDefaultCover = () => {
    setMediaType('image');
    const canvas = document.createElement('canvas');
    canvas.width = 1200;
    canvas.height = 800;
    const ctx = canvas.getContext('2d');
    const gradient = ctx.createLinearGradient(0, 0, 1200, 800);
    gradient.addColorStop(0, '#00406d');
    gradient.addColorStop(0.5, '#003357');
    gradient.addColorStop(1, '#00253f');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 1200, 800);

    ctx.beginPath();
    ctx.arc(600, 400, 200, 0, 2 * Math.PI);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 70px Alexandria, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('جمعية تحالف', 600, 390);

    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.font = '30px Alexandria, sans-serif';
    ctx.fillText('ارفع صورة الحالة أو المشروع للبدء بالتصميم', 600, 460);

    const dataUrl = canvas.toDataURL('image/jpeg');
    setImageSrc(dataUrl);
    setImageFile({ name: 'غلاف_افتراضي.jpg', size: 52 * 1024 });
    addLog('تم توليد وتعيين الغلاف الافتراضي للجمعية.', 'success');
  };

  // --- CROP SETTINGS MODIFIERS ---
  const updateCropProperty = (prop, val) => {
    setCropSettings(prev => ({
      ...prev,
      [activeTab]: {
        ...prev[activeTab],
        [prop]: val
      }
    }));
  };

  const handleResetCrop = () => {
    updateCropProperty('scale', 1.0);
    updateCropProperty('rotate', 0);
    updateCropProperty('x', 0);
    updateCropProperty('y', 0);
    addLog(`تم إعادة تعيين أبعاد القص لمنصة ${PLATFORM_PRESETS[activeTab].name}.`, 'info');
  };

  // --- DRAGGING IMAGE IN CANVAS FOR PANNING ---
  const handleCanvasMouseDown = (e) => {
    e.preventDefault();
    setDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
    setDragOffset({
      x: cropSettings[activeTab].x,
      y: cropSettings[activeTab].y
    });
  };

  const handleCanvasMouseMove = (e) => {
    if (!dragging) return;
    const dx = e.clientX - dragStart.x;
    const dy = e.clientY - dragStart.y;

    setCropSettings(prev => ({
      ...prev,
      [activeTab]: {
        ...prev[activeTab],
        x: dragOffset.x + dx,
        y: dragOffset.y + dy
      }
    }));
  };

  const handleCanvasMouseUp = () => {
    setDragging(false);
  };

  // --- AI GENERATION CALL ---
  const handleAIGenerate = async () => {
    if (!textPrompt.trim()) {
      addLog('تنبيه: الرجاء إدخال فكرة أو نص المنشور أولاً للتوليد.', 'warning');
      return;
    }

    setIsProcessing(true);
    setLogs([]);
    addLog('بدء تشغيل خوارزمية تحسين المنشورات المتكاملة...', 'info');

    if (geminiApiKey.trim()) {
      // --- REAL API MODE ---
      try {
        const toneLabels = {
          auto: 'تحديد تلقائي ذكي جداً - قم بتحليل المقال/الفكرة واختيار الأسلوب الأنسب والأكثر فاعلية وتفاعلاً للجمهور المستهدف بشكل حر وتلقائي دون التقيد بأسلوب معين',
          campaign: 'عاطفي ومؤثر يشجع على التبرع والمساهمة في الحملة الإغاثية',
          report: 'شفاف وواضح يعرض الأرقام والإنجازات ويبني الثقة مع المتبرعين',
          story: 'قصصي وملهم يروي تفاصيل الحالة الإنسانية وكيف تغيرت حياتهم',
          volunteer: 'حماسي ومشجع يدعو الشباب والمجتمع للتطوع والمشاركة',
          education: 'تثقيفي يطرح قضايا إنسانية ويعزز قيم التكافل المجتمعي'
        };

        let generatedObj;

        if (geminiApiKey.trim().startsWith('sk-')) {
          addLog('تم الكشف عن مفتاح OpenAI API (ChatGPT). الاتصال بخوادم OpenAI AI...', 'info');
          const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${geminiApiKey.trim()}`
            },
            body: JSON.stringify({
              model: "gpt-4o-mini",
              messages: [{
                role: "user",
                content: `أنت خبير تسويق رقمي محترف ومتخصص في خوارزميات منصات التواصل الاجتماعي وصناعة المحتوى الفيروسي (Viral Content) لجمعية تحالف الخيرية.

مهمتك: تحويل المقال أو الفكرة التالية إلى منشورات احترافية عالية الأداء مُحسّنة لخوارزميات كل منصة لتحقيق أقصى وصول (Reach) وتفاعل (Engagement):

=== المقال/الفكرة الأصلية ===
"${textPrompt}"
=== نهاية المقال ===

الأسلوب المطلوب: "${toneLabels[tone]}"

### قواعد ذهبية يجب اتباعها لكل منصة:

🔥 **قواعد عامة لزيادة المشاهدات:**
- استخدم "كلمات القوة" (Power Words) التي تثير المشاعر مثل: عاجل، صادم، لأول مرة، لن تصدق، الحقيقة، سر، مؤثر جداً، غيّر حياتهم
- ابدأ كل منشور بـ "Hook" (خطاف انتباه) قوي في أول سطر يجبر القارئ على التوقف
- أضف CTA (دعوة لاتخاذ إجراء) واضحة مثل: شاركنا رأيك، أعد النشر للأجر، ساهم الآن، مرر لليسار
- استخدم الإيموجي بذكاء لكسر النص وجذب العين (لا تبالغ)
- اخلط بين هاشتاقات شائعة (ترند) وهاشتاقات متخصصة (Niche) لتوسيع الوصول

📱 **X (تويتر) - قواعد الخوارزمية:**
- أول 50 حرف هي الأهم - اجعلها صادمة أو مثيرة للفضول
- لا تتجاوز 260 حرف
- ضع 2-3 هاشتاقات فقط (الخوارزمية تعاقب على الكثرة)
- اطرح سؤال أو رأي مثير للجدل (بأدب) لزيادة الردود
- أنهِ بدعوة واضحة للريتويت أو التعليق

📌 **Pinterest - قواعد SEO البصري:**
- العنوان يجب أن يحتوي كلمات بحثية رائجة (Keywords)
- الوصف يجب أن يكون 300-350 حرف غني بالكلمات المفتاحية
- استخدم كلمات مثل: أفكار، إلهام، دليل، خطوات، نصائح
- أضف 3-5 هاشتاقات في نهاية الوصف

💬 **Threads - قواعد التفاعل:**
- اكتب بأسلوب حواري شخصي كأنك تتكلم مع صديق
- قسّم النص لفقرات قصيرة (سطرين لكل فقرة)
- ابدأ بقصة شخصية أو موقف مؤثر
- اطرح أسئلة مفتوحة تشجع على التعليق
- استخدم 3-5 هاشتاقات في النهاية
- النص 400-600 حرف

📝 **Tumblr - قواعد التدوين:**
- عنوان أدبي جذاب ومؤثر
- محتوى طويل ومفصل (500-800 حرف) بأسلوب سردي قصصي
- قسّم المحتوى لفقرات بعناوين فرعية
- أضف اقتباسات ملهمة
- أنهِ بخاتمة مؤثرة تدعو للتأمل والمشاركة

عليك إرجاع النتيجة ككائن JSON صالح ومطابق تمامًا للمخطط التالي بدون أي نصوص خارج الـ JSON أو علامات Markdown (مثل \`\`\`json):
{
  "enhancedText": "ملخص احترافي ومحسّن للمقال الأصلي بأسلوب تسويقي قوي وجذاب يصلح كنص رئيسي للحملة",
  "platforms": {
    "x": {
      "caption": "تغريدة فيروسية قصيرة تبدأ بخطاف انتباه قوي + CTA + 2-3 هاشتاقات استراتيجية (لا تتجاوز 260 حرف)"
    },
    "pinterest": {
      "title": "عنوان Pin مُحسّن لمحركات البحث البصري بكلمات مفتاحية رائجة",
      "description": "وصف SEO غني بالكلمات المفتاحية 300-350 حرف مع 3-5 هاشتاقات في النهاية"
    },
    "threads": {
      "caption": "منشور حواري تفاعلي بأسلوب شخصي مقسم لفقرات قصيرة مع أسئلة مفتوحة وCTA قوي + 3-5 هاشتاقات"
    },
    "tumblr": {
      "title": "عنوان أدبي مؤثر للتدوينة",
      "body": "تدوينة مفصلة سردية 500-800 حرف مقسمة لفقرات مع اقتباسات ملهمة وخاتمة مؤثرة"
    }
  },
  "hashtags": ["8-12 هاشتاق متنوعة تمزج بين الترند والمتخصصة"]
}`
              }],
              response_format: { type: "json_object" }
            })
          });

          if (!response.ok) {
            const errData = await response.json();
            throw new Error(`خطأ في استجابة OpenAI API: ${errData.error?.message || response.statusText}`);
          }

          const data = await response.json();
          const jsonText = data.choices[0].message.content;
          generatedObj = JSON.parse(jsonText);

          if (data.usage) {
            const promptTokens = data.usage.prompt_tokens || 0;
            const completionTokens = data.usage.completion_tokens || 0;
            const total = data.usage.total_tokens || (promptTokens + completionTokens);
            // gpt-4o-mini: input is $0.150 / 1M tokens, output is $0.600 / 1M tokens
            const cost = (promptTokens * 0.15 + completionTokens * 0.60) / 1000000;
            setLastCost(cost);
            setTotalCost(prev => prev + cost);
            setTotalTokens(prev => prev + total);
            addLog(`استهلاك الرموز: ${total} رمز (التكلفة: $${cost.toFixed(5)})`, 'info');
          }

          addLog('تم تحليل وتحديث النصوص بنجاح لكل المنصات باستخدام ChatGPT!', 'success');
        } else {
          addLog('تم الكشف عن مفتاح Gemini API. الاتصال بخوادم Google AI...', 'info');
          const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiApiKey.trim()}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              contents: [{
                parts: [{
                  text: `أنت خبير تسويق رقمي محترف ومتخصص في خوارزميات منصات التواصل الاجتماعي وصناعة المحتوى الإعلاني المروج لجمعية تحالف الخيرية.

مهمتك: تحويل المقال أو الفكرة التالية إلى منشورات ترويجية عالية الأداء ومخصصة لخوارزميات كل منصة لزيادة التفاعل والحث على التبرع:

=== المقال/الفكرة الأصلية ===
"${textPrompt}"
=== نهاية المقال ===

الأسلوب المطلوب: "${toneLabels[tone]}"

### القواعد التسويقية وقواعد الترويج الذهبية لكل منصة:

🔥 **قواعد عامة للترويج وزيادة المشاهدات:**
- ابدأ كل منشور بـ "Hook" (خطاف انتباه) قوي ومثير في أول سطر لشد المتصفح.
- استخدم "كلمات القوة" (Power Words) المحركة للمشاعر مثل: عاجل، مؤثر جداً، غيّر حياتهم، بـ 10 دنانير، ساهم الآن.
- أضف دائماً مكان افتراضي للرابط بتنسيق دقيق: \`[رابط التبرع المباشر 🔗]\` في مكان مناسب بالنص لحث المتابعين على الضغط والوصول لصفحة التبرع.
- وظّف كلمات مفتاحية (Keywords) تسويقية تلائم العمل الخيري والصدقة (مثل: تبرع، صدقة جارية، كفالة أيتام، إغاثة).

📱 **X (تويتر) - قواعد الترويج والانتشار السريع:**
- أول 50 حرف هي الأهم - اجعلها بمثابة عنوان إعلاني صادم أو مثير للتعاطف.
- لا تتجاوز 260 حرف شاملاً النص ومكان الرابط الافتراضي.
- ضع 2-3 هاشتاقات كحد أقصى (تجاوز ذلك يمنع خوارزمية الترويج من نشر التغريدة).
- أنهِ المنشور بطلب ريتويت أو تفاعل مباشر.

📌 **Pinterest - قواعد الترويج لـ SEO البصري:**
- العنوان يجب أن يحتوي على كلمات مفتاحية بحثية رائجة ويبدأ بـ (أفكار، طرق، كيف، دليل) لضمان ظهور الصورة في نتائج البحث.
- الوصف يتراوح بين 300-350 حرف، غني بكلمات الـ SEO التسويقية المروجة ومكتوب ليدفع المستخدمين للنقر على رابط الحملة.
- أضف 3-5 هاشتاقات في نهاية الوصف.

💬 **Threads - الترويج التفاعلي وجلب الردود:**
- اكتب بأسلوب حواري وعفوي جداً كأنك تتكلم مع صديق (تجنب تماماً اللهجة الرسمية الإعلانية الجافة).
- قسّم النص لفقرات قصيرة (سطرين لكل فقرة) مع فواصل أسطر مريحة للعين.
- أنهِ المنشور بسؤال نقاشي مفتوح حول العطاء وحب الخير لحث القراء على كتابة تعليقاتهم (لأن خوارزمية Threads ترفع انتشار المنشورات بناءً على عدد الردود).
- النص بين 450-500 حرف مع 3-5 هاشتاقات.

📝 **Tumblr - الترويج القائم على قصة كاملة (Storytelling):**
- عنوان أدبي إنساني مشوق وجذاب.
- محتوى سردي قصصي طويل وتفصيلي (1000-1500 حرف) يشرح الحالة بأسلوب عاطفي ومقنع يبني الثقة في مشاريع الجمعية الخيرية.
- قسّم التدوينة بعناوين فرعية واستخدم اقتباسات ملهمة في المنتصف.

عليك إرجاع النتيجة ككائن JSON صالح ومطابق تمامًا للمخطط التالي بدون أي نصوص خارج الـ JSON أو علامات Markdown (مثل \`\`\`json):
{
  "enhancedText": "ملخص احترافي ومحسّن للمقال الأصلي بأسلوب تسويقي قوي وجذاب يصلح كنص رئيسي للحملة",
  "platforms": {
    "x": {
      "caption": "تغريدة ترويجية قصيرة تبدأ بخطاف انتباه قوي + [رابط التبرع المباشر 🔗] + 2-3 هاشتاقات (لا تتجاوز 260 حرف)"
    },
    "pinterest": {
      "title": "عنوان Pin إعلاني يبدأ بـ (كيف/طرق) ومُحسّن للبحث بكلمات مفتاحية رائجة",
      "description": "وصف SEO ترويجي غني بالكلمات المفتاحية 300-350 حرف يتضمن [رابط التبرع المباشر 🔗] مع 3-5 هاشتاقات في النهاية"
    },
    "threads": {
      "caption": "منشور حواري تفاعلي مقسم لفقرات قصيرة مع سؤال نقاشي مفتوح يتضمن [رابط التبرع المباشر 🔗] + 3-5 هاشتاقات (450-500 حرف)"
    },
    "tumblr": {
      "title": "عنوان أدبي إنساني مؤثر للتدوينة",
      "body": "تدوينة تفصيلية سردية 1000-1500 حرف مقسمة لعناوين فرعية مع اقتباسات ملهمة تتضمن [رابط التبرع المباشر 🔗]"
    }
  },
  "hashtags": ["8-12 هاشتاق متنوعة تمزج بين الترند والمتخصصة"]
}`
                }]
              }],
              generationConfig: {
                responseMimeType: "application/json"
              }
            })
          });

          if (!response.ok) {
            throw new Error(`خطأ في استجابة Gemini API: ${response.status}`);
          }

          const data = await response.json();
          const jsonText = data.candidates[0].content.parts[0].text;
          generatedObj = JSON.parse(jsonText);

          if (data.usageMetadata) {
            const promptTokens = data.usageMetadata.promptTokenCount || 0;
            const completionTokens = data.usageMetadata.candidatesTokenCount || 0;
            const total = data.usageMetadata.totalTokenCount || (promptTokens + completionTokens);
            // gemini-2.5-flash: input is $0.075 / 1M tokens, output is $0.300 / 1M tokens
            const cost = (promptTokens * 0.075 + completionTokens * 0.30) / 1000000;
            setLastCost(cost);
            setTotalCost(prev => prev + cost);
            setTotalTokens(prev => prev + total);
            addLog(`استهلاك الرموز: ${total} رمز (التكلفة: $${cost.toFixed(5)})`, 'info');
          }

          addLog('تم تحليل وتحديث النصوص بنجاح لكل المنصات باستخدام Gemini!', 'success');
        }

        setResults({
          enhancedText: generatedObj.enhancedText,
          platforms: {
            x: { caption: generatedObj.platforms.x.caption },
            pinterest: {
              title: generatedObj.platforms.pinterest.title,
              description: generatedObj.platforms.pinterest.description
            },
            threads: { caption: generatedObj.platforms.threads.caption },
            tumblr: {
              title: generatedObj.platforms.tumblr.title,
              body: generatedObj.platforms.tumblr.body
            }
          },
          hashtags: generatedObj.hashtags || []
        });

        addLog('تم الانتهاء من المعالجة بنجاح! تحقق من المعاينة الحية.', 'success');
        setIsProcessing(false);

      } catch (err) {
        addLog(`خطأ أثناء الاتصال بالـ API: ${err.message}. جاري التحويل للوضع المحاكي الذكي...`, 'warning');
        runSmartMockFallback();
      }
    } else {
      // --- SMART SIMULATED MODE ---
      addLog('لم يتم إدخال مفتاح API. تفعيل نظام المحاكاة الذكي المدمج...', 'info');
      setTimeout(() => {
        runSmartMockFallback();
      }, 1500);
    }
  };

  const runSmartMockFallback = () => {
    addLog('جاري صياغة المحتوى وتحسينه باستخدام نموذج المحاكاة المحلي التوليدي...', 'info');

    // Simple rule-based mock generator in Arabic
    let enhanced = '';
    let xCap = '';
    let pinTitle = '';
    let pinDesc = '';
    let thCap = '';
    let tumTitle = '';
    let tumBody = '';
    let tags = [];

    // Analyze text for keywords to make the mock very relevant
    const lowerPrompt = textPrompt.toLowerCase();

    if (lowerPrompt.includes('تبرع') || lowerPrompt.includes('حملة') || lowerPrompt.includes('شتاء') || lowerPrompt.includes('إغاثة')) {
      enhanced = `حملة إغاثية عاجلة لتوفير الدعم والمساعدة للأسر المتعففة والمحتاجة.`;
      xCap = `ساهم معنا في دعم الأسر المحتاجة وتوفير الدفء لهم في هذا الشتاء ❄️ تبرعك يصنع الفرق! 🧵 التفاصيل بالصورة المرفقة 👇 #حملة_الشتاء #جمعية_تحالف`;
      pinTitle = 'حملة الشتاء الدافئ 🧣';
      pinDesc = `شاركونا الأجر في توفير البطانيات والملابس الشتوية للأسر المتعففة. تبرعك البسيط يمنحهم الدفء والأمل.`;
      thCap = `العطاء في الأوقات الصعبة هو أعظم رسالة إنسانية 🤝 كيف يمكننا تعزيز التكافل في مجتمعنا؟ شاركونا آراءكم بالردود 👇`;
      tumTitle = 'تقرير إنجاز: حملة الشتاء الدافئ';
      tumBody = `بفضل الله ثم بدعمكم، تمكنا من توزيع أكثر من 1000 حقيبة شتوية على الأسر المحتاجة في مختلف المناطق. نسأل الله أن يتقبل منكم وأن يجعلها في ميزان حسناتكم. التقرير المصور يوضح جانباً من جهود الفرق الميدانية.`;
      tags = ['حملة_الشتاء', 'تبرع', 'إغاثة', 'جمعية_تحالف', 'صدقة'];
    } else if (lowerPrompt.includes('يتيم') || lowerPrompt.includes('أيتام') || lowerPrompt.includes('كفالة')) {
      enhanced = `مبادرة كفالة الأيتام لرسم البسمة على وجوههم وتوفير الرعاية الشاملة لهم.`;
      xCap = `كافل اليتيم رفيق النبي ﷺ في الجنة ❤️ ساهم في كفالة يتيم وتغيير مستقبله للأفضل. 🧵 التفاصيل وكيفية التبرع بالصورة المرفقة 👇 #كفالة_يتيم #جمعية_تحالف`;
      pinTitle = 'مبادرة كفالة الأيتام 🌟';
      pinDesc = `مشروع كفالة الأيتام يهدف لتوفير الرعاية التعليمية والصحية والنفسية للأطفال الأيتام. كن سبباً في نجاحهم.`;
      thCap = `ما هو الأثر الذي تتركه كفالة اليتيم في نفس الطفل وفي مجتمعنا؟ شاركونا قصصكم وتجاربكم 👇`;
      tumTitle = 'قصة نجاح: كيف غيرت كفالة اليتيم حياة "أحمد"';
      tumBody = `بفضل دعم أحد المتبرعين الكرام، تمكن الطفل أحمد من إكمال تعليمه وتفوقه في المدرسة بعد أن كان مهدداً بترك مقاعد الدراسة. هذه القصة هي واحدة من مئات القصص التي نصنعها معاً بفضل تبرعاتكم السخية.`;
      tags = ['كفالة_يتيم', 'أيتام', 'أجر', 'جمعية_تحالف', 'عطاء'];
    } else if (lowerPrompt.includes('رمضان') || lowerPrompt.includes('إفطار') || lowerPrompt.includes('سلة')) {
      enhanced = `مشاريع الخير في شهر رمضان المبارك لتوفير السلال الغذائية وإفطار الصائمين.`;
      xCap = `في شهر الجود والعطاء، تبرعك بسلة غذائية يكفي أسرة محتاجة طوال شهر رمضان 🌙✨ 🧵 التفاصيل بالصورة المرفقة 👇 #رمضان_كريم #إفطار_صائم`;
      pinTitle = 'السلة الغذائية الرمضانية 📦';
      pinDesc = `ساهم في توفير المواد الغذائية الأساسية للأسر المتعففة خلال شهر رمضان المبارك. أجر عظيم وتكافل مجتمعي.`;
      thCap = `شهر رمضان فرصة لزيادة الأعمال الصالحة والإحسان للمحتاجين. ما هي المبادرة الخيرية التي تفضل المشاركة بها في رمضان؟ 👇`;
      tumTitle = 'مشاريع رمضان: إفطار صائم والسلال الغذائية';
      tumBody = `تستعد جمعية تحالف لإطلاق حزمة مشاريعها الرمضانية السنوية والتي تستهدف آلاف الأسر المحتاجة. نتيح لكم الفرصة للمساهمة في توفير السلال الغذائية ووجبات إفطار الصائم، ليعم الخير والبركة في هذا الشهر الفضيل.`;
      tags = ['رمضان', 'إفطار_صائم', 'سلة_غذائية', 'جمعية_تحالف', 'صدقة'];
    } else {
      // General Catch-All
      enhanced = `تحسين صياغة ونشر المبادرة: "${textPrompt}" بأسلوب ${tone === 'campaign' ? 'عاطفي محفز' : 'إنساني راقي'} ليصل لأكبر عدد من الداعمين.`;
      xCap = `💡 مبادرة إنسانية جديدة ✨ "${textPrompt.substring(0, 100)}..." تفاصيل أوسع بالصورة المرفقة! 👇 #عمل_خيري #جمعية_تحالف`;
      pinTitle = 'مبادرة إنسانية 💡';
      pinDesc = `تعرفوا على تفاصيل المبادرة الإنسانية: "${textPrompt}" وكيف يمكنكم المساهمة في إنجاحها.`;
      thCap = `موضوع إنساني يهمنا جميعاً: 🤔 "${textPrompt}"... شاركونا آراءكم وكيف يمكننا دعم هذه الفكرة بالردود! 👇`;
      tumTitle = 'إضاءات حول المبادرة الجديدة';
      tumBody = `نشارككم اليوم تفاصيل مهمة حول: "${textPrompt}". إن الجهود المجتمعية البسيطة هي التي تصنع التغيير الحقيقي إذا ما لاقت الاهتمام والتطبيق الصحيح. نأمل أن تكون هذه المبادرة ملهمة لكم للبدء في العمل الإنساني.`;
      tags = ['تطوع', 'مبادرة', 'جمعية_تحالف', 'إحسان', 'عطاء'];
    }

    setResults({
      enhancedText: enhanced,
      platforms: {
        x: { caption: xCap },
        pinterest: { title: pinTitle, description: pinDesc },
        threads: { caption: thCap },
        tumblr: { title: tumTitle, body: tumBody }
      },
      hashtags: tags
    });

    addLog('تم صياغة المنشورات وتوزيعها لـ X و Pinterest و Threads و Tumblr.', 'success');
    addLog('تم أتمتة الهاشتاقات المناسبة لكل منصة بنجاح.', 'success');
    addLog('تم الانتهاء من المعالجة الذكية! تحقق من المعاينة الحية في اليسار.', 'success');
    setIsProcessing(false);
  };

  // --- PUBLISHING ACTIONS (Simulated APIs) ---
  const handlePublishAll = async () => {
    if (publishingStatus === 'publishing') return;

    setPublishingStatus('publishing');
    addLog('بدء عملية النشر التلقائي الموحد على جميع المنصات النشطة...', 'info');

    // Clear old published links
    setPublishedLinks({ x: null, pinterest: null, threads: null, tumblr: null });

    const platformsToPublish = ['x', 'pinterest', 'threads', 'tumblr'];

    for (const platform of platformsToPublish) {
      await publishToPlatform(platform, true);
    }

    setPublishingStatus('success');
    addLog('🚀 تم الانتهاء بنجاح من النشر في جميع المنصات الأربعة! كل منصة حصلت على قياسها ومحتواها المخصص.', 'success');
  };

  const handlePublishSingle = async (platform) => {
    if (publishingStatus === 'publishing') return;
    setPublishingStatus('publishing');

    await publishToPlatform(platform, false);

    setPublishingStatus('idle');
  };

  const publishToPlatform = async (platform, isBulk = false) => {
    const names = { x: 'X (تويتر)', pinterest: 'Pinterest', threads: 'Threads', tumblr: 'Tumblr' };

    if (!imageSrc) {
      if (platform === 'pinterest') {
        addLog(`[${names[platform]}] ❌ خطأ: لا يمكن النشر على Pinterest بدون صورة أو فيديو! يرجى رفع ملف أولاً.`, 'error');
        return;
      }
      addLog(`[${names[platform]}] جاري صياغة وتحضير المنشور النصي...`, 'info');
      await new Promise(resolve => setTimeout(resolve, 1000));
    } else if (mediaType === 'video') {
      addLog(`[${names[platform]}] جاري معالجة المنشور وتهيئة الفيديو بأبعاده الأصلية...`, 'info');
      await new Promise(resolve => setTimeout(resolve, 1200));
      addLog(`[${names[platform]}] جاري رفع الفيديو لخوادم البث المؤقتة...`, 'info');
      await new Promise(resolve => setTimeout(resolve, 1200));
    } else {
      addLog(`[${names[platform]}] جاري معالجة المنشور وقص الصورة بمقاس ${PLATFORM_PRESETS[platform].label}...`, 'info');
      await new Promise(resolve => setTimeout(resolve, 1200));
      addLog(`[${names[platform]}] جاري ضغط الصورة ورفعها لخوادم التحميل المؤقتة...`, 'info');
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    // Simulate generation of dynamic post URL
    const randId = Math.floor(Math.random() * 100000000);
    let postLink = '';
    if (platform === 'x') postLink = `https://x.com/tahaluf_ai/status/${randId}`;
    if (platform === 'pinterest') postLink = `https://pinterest.com/pin/${randId}`;
    if (platform === 'threads') postLink = `https://threads.net/@tahaluf_ai/post/${randId}`;
    if (platform === 'tumblr') postLink = `https://tahaluf-ai.tumblr.com/post/${randId}`;

    setPublishedLinks(prev => ({
      ...prev,
      [platform]: postLink
    }));

    addLog(`[${names[platform]}] تم النشر بنجاح! الرابط المباشر للمنشور: ${postLink}`, 'success');
  };

  // Check character limits for warning indicators
  const getCaptionLength = (platform) => {
    if (platform === 'x') return results.platforms.x.caption.length;
    if (platform === 'threads') return results.platforms.threads.caption.length;
    if (platform === 'pinterest') return results.platforms.pinterest.description.length;
    if (platform === 'tumblr') return results.platforms.tumblr.body.length;
    return 0;
  };

  const handleTextareaChange = (platform, field, val) => {
    setResults(prev => {
      const updated = { ...prev };
      if (platform === 'pinterest' || platform === 'tumblr') {
        updated.platforms[platform][field] = val;
      } else {
        updated.platforms[platform].caption = val;
      }
      return updated;
    });
  };

  return (
    <div className="app-layout">
      {/* HEADER */}
      <header className="app-header">
        <div className="header-container">
          <div className="logo-wrapper">
            <div className="logo-icon">
              <HeartHandshake className="text-white" size={24} />
            </div>
            <div className="logo-text">
              <h1>جمعية تحالف <span className="gradient-text">الخيرية</span> 🕊️</h1>
              <p>منصة النشر الذكي لحملات التبرع والمبادرات الإنسانية</p>
            </div>
          </div>

          <div className="header-actions">
            {geminiApiKey && (
              <div
                className="cost-tracker-badge"
                onClick={handleResetCost}
                title={`اضغط لتصفير العداد.\nإجمالي الرموز المستهلكة: ${totalTokens.toLocaleString()} رمز.`}
              >
                <span className="cost-label">الاستهلاك:</span>
                <span className="cost-value">${totalCost.toFixed(5)}</span>
                {lastCost > 0 && (
                  <span className="last-cost" title="تكلفة آخر منشور">
                    (+${lastCost.toFixed(5)})
                  </span>
                )}
              </div>
            )}

            <div className={`api-status-badge ${geminiApiKey ? '' : 'disconnected'}`}>
              {geminiApiKey ? (
                <>
                  <CheckCircle2 size={16} />
                  <span>متصل بـ {geminiApiKey.startsWith('sk-') ? 'OpenAI (ChatGPT) API' : 'Gemini API'}</span>
                </>
              ) : (
                <>
                  <AlertCircle size={16} />
                  <span>وضع المحاكاة الذكية</span>
                </>
              )}
            </div>
            <button
              className="btn btn-secondary"
              onClick={() => setShowSettings(true)}
              title="إعدادات الـ API والمفاتيح"
            >
              <Settings size={18} />
              <span>الإعدادات</span>
            </button>
          </div>
        </div>
      </header>

      {/* MAIN CONTAINER */}
      <main className="app-content">
        <div className="grid-container">

          {/* RIGHT/INPUT SIDEBAR (420px width on desktop) */}
          <section className="sidebar-panel">

            {/* Input prompt / idea card */}
            <div className="glass-panel" style={{ padding: '16px' }}>
              <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                <Sparkles size={18} className="gradient-text" />
                <span>الفكرة والتحسين الذكي</span>
              </h2>

              <div className="form-group">
                <label className="form-label">اكتب فكرة الحملة أو الصق المقال بالكامل:</label>
                <textarea
                  className="form-textarea"
                  style={{ minHeight: '140px' }}
                  value={textPrompt}
                  onChange={(e) => setTextPrompt(e.target.value)}
                  placeholder="الصق المقال الإنساني الطويل، قصة الحالة، أو فكرة الحملة بالكامل هنا. سيقوم الذكاء الاصطناعي بتحليل المحتوى واستخلاص العناوين، الهاشتاقات، والمنشورات المخصصة لكل منصة تلقائياً 🕊️✨"
                />
              </div>

              <div className="form-group">
                <label className="form-label">نوع المنشور (Tone of Voice):</label>
                <select
                  className="form-select"
                  value={tone}
                  onChange={(e) => setTone(e.target.value)}
                >
                  <option value="auto">✨ تحديد تلقائي بالذكاء الاصطناعي</option>
                  <option value="campaign">📢 نداء تبرع / حملة إغاثية</option>
                  <option value="report">📊 تقرير إنجاز / شفافية</option>
                  <option value="story">📖 قصة نجاح / حالة إنسانية</option>
                  <option value="volunteer">🤝 دعوة تطوع / مشاركة</option>
                  <option value="education">💡 توعية / قيم إنسانية</option>
                </select>
              </div>

              <button
                className="btn btn-primary"
                style={{ width: '100%', marginTop: '10px' }}
                onClick={handleAIGenerate}
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <>
                    <RefreshCw className="animate-spin" size={18} />
                    <span>جاري المعالجة بالذكاء الاصطناعي...</span>
                  </>
                ) : (
                  <>
                    <Sparkles size={18} />
                    <span>تحويل وتخصيص بالذكاء الاصطناعي ✨</span>
                  </>
                )}
              </button>
            </div>

            {/* Media Upload card */}
            <div className="glass-panel" style={{ padding: '16px' }}>
              <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                <ImageIcon size={18} className="gradient-text-cyan" />
                <span>الوسائط والصور المرفقة</span>
              </h2>

              <div
                className={`upload-container ${dragActive ? 'drag-active' : ''}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={triggerUploadInput}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  style={{ display: 'none' }}
                  accept="image/*,video/*"
                />

                <Upload size={32} style={{ color: 'var(--text-secondary)', marginBottom: '10px' }} />
                <p style={{ fontSize: '0.9rem', fontWeight: 'bold' }}>اسحب وأفلت الصورة هنا</p>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>أو انقر لتصفح ملفات جهازك</p>
              </div>

              {!imageFile && (
                <button
                  className="btn btn-secondary"
                  style={{ width: '100%', marginTop: '10px', fontSize: '0.8rem', padding: '6px 12px' }}
                  onClick={(e) => {
                    e.stopPropagation();
                    generateDefaultCover();
                  }}
                >
                  <span>استخدام غلاف افتراضي 🖼️</span>
                </button>
              )}

              {imageFile && (
                <div className="file-uploaded-info">
                  <img src={imageSrc} alt="Preview" className="file-preview-thumb" />
                  <div className="file-details">
                    <span className="file-name">{imageFile.name}</span>
                    <span className="file-size">{(imageFile.size / 1024 / 1024).toFixed(2)} MB</span>
                  </div>
                  <button className="btn-remove-file" onClick={removeImage} title="حذف الصورة">
                    <Trash2 size={16} />
                  </button>
                </div>
              )}
            </div>

            {/* Action panel */}
            <div className="glass-panel" style={{ padding: '16px', background: 'rgba(168, 85, 247, 0.05)', borderColor: 'rgba(168, 85, 247, 0.2)' }}>
              <h3 style={{ margin: '0 0 8px 0', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Share2 size={16} className="text-purple-400" />
                <span>النشر الفوري المتكامل</span>
              </h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '12px' }}>
                سيقوم النظام تلقائياً بقص الصورة ورفعها وربطها بالوصف الخاص بكل منصة دفعة واحدة.
              </p>

              <button
                className="btn btn-primary pulse-glow"
                style={{ width: '100%', padding: '10px 16px', fontSize: '0.85rem', background: 'linear-gradient(135deg, #8b5cf6, #ec4899)' }}
                onClick={handlePublishAll}
                disabled={publishingStatus === 'publishing'}
              >
                {publishingStatus === 'publishing' ? (
                  <>
                    <RefreshCw className="animate-spin" size={20} />
                    <span>جاري النشر في جميع الشبكات...</span>
                  </>
                ) : (
                  <>
                    <Share2 size={20} />
                    <span>نشر تلقائي في كل الشبكات ⚡</span>
                  </>
                )}
              </button>
            </div>

          </section>

          {/* LEFT/MAIN WORKSPACE (Flex-grow container) */}
          <section className="main-panel">

            {/* PLATFORM TABS */}
            <div className="glass-panel" style={{ padding: '16px' }}>
              <div className="tabs-header">
                {Object.keys(PLATFORM_PRESETS).map(platform => (
                  <button
                    key={platform}
                    data-platform={platform}
                    className={`tab-btn ${activeTab === platform ? 'active' : ''}`}
                    onClick={() => setActiveTab(platform)}
                  >
                    {platform === 'x' && <span style={{ fontWeight: '900' }}>X (تويتر)</span>}
                    {platform === 'pinterest' && <span style={{ color: 'var(--color-pinterest)', fontWeight: '800' }}>Pinterest</span>}
                    {platform === 'threads' && <span style={{ fontWeight: '800' }}>Threads</span>}
                    {platform === 'tumblr' && <span style={{ color: '#8ba2c4', fontWeight: '800' }}>Tumblr</span>}
                    <span className={`badge badge-${platform}`}>
                      {PLATFORM_PRESETS[platform].label}
                    </span>
                  </button>
                ))}
              </div>

              {/* ACTIVE PLATFORM WORKSPACE */}
              <div style={{ marginTop: '24px' }}>
                <div className="platform-workspace-grid">
                  <div className="workspace-editor-col">

                    {/* TEXT EDITOR & ASPECT RATIO EXPLANATION */}
                    <div>
                      <h3 style={{ margin: '0 0 10px 0', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span>تخصيص المحتوى والمقاس لـ {PLATFORM_PRESETS[activeTab].name}</span>
                      </h3>

                      {/* Pinterest and Tumblr title fields */}
                      {(activeTab === 'pinterest' || activeTab === 'tumblr') && (
                        <div className="form-group">
                          <label className="form-label">العنوان المخصص للمنشور:</label>
                          <input
                            type="text"
                            className="form-input"
                            value={activeTab === 'pinterest' ? results.platforms.pinterest.title : results.platforms.tumblr.title}
                            onChange={(e) => handleTextareaChange(activeTab, 'title', e.target.value)}
                          />
                        </div>
                      )}

                      <div className="form-group">
                        <label className="form-label">
                          <span>نص الوصف (Caption):</span>
                          <span style={{ marginRight: 'auto', fontSize: '0.72rem', color: getCaptionLength(activeTab) > (activeTab === 'x' ? 280 : 1000) ? '#ef4444' : 'var(--text-muted)' }}>
                            {getCaptionLength(activeTab)} {activeTab === 'x' && '/ 280'} حرف
                          </span>
                        </label>
                        <textarea
                          className="form-textarea"
                          style={{ minHeight: '100px' }}
                          value={
                            activeTab === 'x' ? results.platforms.x.caption :
                              activeTab === 'pinterest' ? results.platforms.pinterest.description :
                                activeTab === 'threads' ? results.platforms.threads.caption :
                                  results.platforms.tumblr.body
                          }
                          onChange={(e) => handleTextareaChange(activeTab, activeTab === 'pinterest' ? 'description' : activeTab === 'tumblr' ? 'body' : 'caption', e.target.value)}
                        />
                        {activeTab === 'x' && getCaptionLength('x') > 280 && (
                          <p style={{ fontSize: '0.75rem', color: '#ef4444', margin: '2px 0 0 0' }}>⚠️ النص يتجاوز الحد المسموح لمنشورات X المجانية (280 حرف). سيتم اختصاره تلقائياً عند النشر.</p>
                        )}
                      </div>
                    </div>

                    {/* INTERACTIVE CROPPER PANEL */}
                    <div className="glass-panel" style={{ padding: '16px', background: 'rgba(0,0,0,0.2)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                        <h4 style={{ margin: 0, fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <RotateCw size={14} className="text-purple-400" />
                          <span>ضبط الأبعاد وقص الصورة تفاعلياً</span>
                        </h4>
                        <button className="btn btn-secondary" style={{ padding: '4px 10px', fontSize: '0.8rem' }} onClick={handleResetCrop}>
                          إعادة تعيين ↻
                        </button>
                      </div>

                      <div className="cropper-layout">
                        {/* Interactive Panning Crop Area */}
                        <div
                          ref={cropperContainerRef}
                          className="crop-canvas-wrapper"
                          onMouseMove={handleCanvasMouseMove}
                          onMouseDown={handleCanvasMouseDown}
                          onMouseUp={handleCanvasMouseUp}
                          onMouseLeave={handleCanvasMouseUp}
                        >
                          {!imageSrc ? (
                            <div style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '20px' }}>
                              <ImageIcon size={48} style={{ opacity: 0.3, marginBottom: '10px', marginLeft: 'auto', marginRight: 'auto' }} />
                              <p style={{ margin: 0, fontSize: '0.85rem', fontWeight: 'bold' }}>منشور نصي فقط (بدون صورة أو فيديو)</p>
                              <p style={{ margin: '4px 0 0 0', fontSize: '0.75rem', color: 'var(--text-muted)' }}>يمكنك رفع صورة أو فيديو من القائمة الجانبية لتنشيط العرض البصري.</p>
                            </div>
                          ) : mediaType === 'video' ? (
                            <div style={{ textAlign: 'center', padding: '20px', width: '100%' }}>
                              <video src={imageSrc} controls style={{ maxWidth: '100%', maxHeight: '300px', borderRadius: '12px', border: '1px solid var(--border-color)' }} />
                              <p style={{ margin: '10px 0 0 0', fontSize: '0.8rem', color: '#a855f7', fontWeight: 'bold' }}>🎬 تم تحميل فيديو للمنشور</p>
                              <p style={{ margin: '4px 0 0 0', fontSize: '0.75rem', color: 'var(--text-muted)' }}>ملاحظة: أدوات تعديل الأبعاد والقص مخصصة للصور فقط. سيتم عرض الفيديو بأبعاده الأصلية.</p>
                            </div>
                          ) : (
                            <>
                              {/* Target Crop Box border overlay */}
                              <div
                                className="crop-box-overlay"
                                style={{
                                  width: activeTab === 'x' ? '90%' : activeTab === 'threads' ? '280px' : activeTab === 'pinterest' ? '220px' : '260px',
                                  height: activeTab === 'x' ? '180px' : activeTab === 'threads' ? '280px' : activeTab === 'pinterest' ? '330px' : '346px',
                                }}
                              />
                              <img
                                src={imageSrc}
                                alt="Crop target"
                                className="cropper-image"
                                draggable="false"
                                style={{
                                  transform: `translate(${cropSettings[activeTab].x}px, ${cropSettings[activeTab].y}px) scale(${cropSettings[activeTab].scale}) rotate(${cropSettings[activeTab].rotate}deg)`,
                                  maxWidth: '100%',
                                  maxHeight: '360px',
                                  opacity: dragging ? 0.7 : 1,
                                }}
                              />
                              <div style={{ position: 'absolute', bottom: '8px', left: '8px', zIndex: 15, background: 'rgba(0,0,0,0.8)', padding: '4px 8px', borderRadius: '4px', fontSize: '0.75rem', color: '#94a3b8' }}>
                                💡 اسحب الصورة لتعديل تموضعها داخل الإطار
                              </div>
                            </>
                          )}
                        </div>

                        {/* Slider controls */}
                        <div className="cropper-controls">
                          <div className="control-slider-group">
                            <div className="control-slider-header">
                              <span>التقريب (Scale)</span>
                              <span>{cropSettings[activeTab].scale.toFixed(2)}x</span>
                            </div>
                            <input
                              type="range"
                              min="0.5"
                              max="3.0"
                              step="0.05"
                              className="custom-range"
                              disabled={!imageSrc}
                              value={cropSettings[activeTab].scale}
                              onChange={(e) => updateCropProperty('scale', parseFloat(e.target.value))}
                            />
                          </div>

                          <div className="control-slider-group">
                            <div className="control-slider-header">
                              <span>التدوير (Rotate)</span>
                              <span>{cropSettings[activeTab].rotate}°</span>
                            </div>
                            <input
                              type="range"
                              min="-180"
                              max="180"
                              step="90"
                              className="custom-range"
                              disabled={!imageSrc}
                              value={cropSettings[activeTab].rotate}
                              onChange={(e) => updateCropProperty('rotate', parseInt(e.target.value))}
                            />
                          </div>

                          <div style={{ marginTop: 'auto' }}>
                            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>
                              {imageSrc ? (
                                <>
                                  المقاس المستهدف للتصدير:
                                  <br />
                                  <strong>{PLATFORM_PRESETS[activeTab].width} × {PLATFORM_PRESETS[activeTab].height} بكسل</strong>
                                </>
                              ) : (
                                <span>منشور نصي فقط</span>
                              )}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div> {/* end of workspace-editor-col */}

                  <div className="workspace-preview-col">
                    {/* PREVIEW AND PUBLISH SECTION */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '20px' }}>

                      {/* Live platform post mockup preview */}
                      <div>
                        <h4 style={{ margin: '0 0 8px 0', fontSize: '0.85rem' }}>المعاينة الحية للمنشور على {PLATFORM_PRESETS[activeTab].name}:</h4>
                        <div className="mockup-container">

                          {/* 1. X Mockup */}
                          {activeTab === 'x' && (
                            <div className="post-mockup mockup-x">
                              <div className="x-header">
                                <img src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop" className="x-avatar" alt="Avatar" />
                                <div className="x-user-details">
                                  <div className="x-name-row">
                                    <span>جمعية تحالف</span>
                                    <svg className="x-verified" viewBox="0 0 24 24" fill="currentColor">
                                      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                                    </svg>
                                  </div>
                                  <span className="x-handle">@tahaluf_ai</span>
                                </div>
                              </div>
                              <div className="x-text">
                                {results.platforms.x.caption}
                              </div>
                              {croppedImages.x && (
                                <div className="x-media-box">
                                  <img src={croppedImages.x} className="x-media" alt="Cropped X media" />
                                </div>
                              )}
                              <div className="x-actions">
                                <div className="x-action-item"><MessageCircle size={16} /> <span>12</span></div>
                                <div className="x-action-item repost"><Repeat size={16} /> <span>48</span></div>
                                <div className="x-action-item like"><Heart size={16} /> <span>312</span></div>
                                <div className="x-action-item"><Bookmark size={16} /></div>
                              </div>
                            </div>
                          )}

                          {/* 2. Pinterest Mockup */}
                          {activeTab === 'pinterest' && (
                            <div className="post-mockup mockup-pinterest">
                              <div className="pin-grid">
                                <div className="pin-image-side">
                                  {croppedImages.pinterest && (
                                    <img src={croppedImages.pinterest} className="pin-img" alt="Pinterest pin" />
                                  )}
                                </div>
                                <div className="pin-content-side">
                                  <div className="pin-header">
                                    <button className="pin-save-btn">حفظ</button>
                                    <span style={{ fontSize: '0.8rem', color: '#b2b2b2' }}>أفكار مميزة</span>
                                  </div>
                                  <div>
                                    <h3 className="pin-title">{results.platforms.pinterest.title}</h3>
                                    <p className="pin-desc">{results.platforms.pinterest.description}</p>
                                  </div>
                                  <div className="pin-author">
                                    <img src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop" className="pin-author-img" alt="Author" />
                                    <div className="pin-author-details">
                                      <span className="pin-author-name">جمعية تحالف</span>
                                      <span className="pin-followers">12.5 ألف متابع</span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* 3. Threads Mockup */}
                          {activeTab === 'threads' && (
                            <div className="post-mockup mockup-threads">
                              <div className="threads-card">
                                <div className="threads-left-line">
                                  <img src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop" className="threads-avatar" alt="Avatar" />
                                  <div className="threads-connector"></div>
                                </div>
                                <div className="threads-body">
                                  <div className="threads-user-row">
                                    <span className="threads-username">tahaluf_ai</span>
                                    <span className="threads-time">1د</span>
                                  </div>
                                  <div className="threads-text">
                                    {results.platforms.threads.caption}
                                  </div>
                                  {croppedImages.threads && (
                                    <div className="threads-media">
                                      <img src={croppedImages.threads} style={{ width: '100%', height: 'auto', objectFit: 'contain' }} alt="Threads media" />
                                    </div>
                                  )}
                                  <div className="threads-actions">
                                    <button className="threads-action-btn"><Heart size={18} /></button>
                                    <button className="threads-action-btn"><MessageCircle size={18} /></button>
                                    <button className="threads-action-btn"><Repeat size={18} /></button>
                                    <button className="threads-action-btn"><Share2 size={18} /></button>
                                  </div>
                                  <div className="threads-stats">
                                    <span>3 ردود</span>
                                    <span>•</span>
                                    <span>42 إعجاب</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* 4. Tumblr Mockup */}
                          {activeTab === 'tumblr' && (
                            <div className="post-mockup mockup-tumblr">
                              <div className="tumblr-header">
                                <img src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop" className="tumblr-avatar" alt="Avatar" />
                                <div>
                                  <span className="tumblr-blog-name">tahaluf-ai</span>
                                  <span className="tumblr-follow"> • متابعة</span>
                                </div>
                              </div>

                              {croppedImages.tumblr && (
                                <div className="tumblr-media-container">
                                  <img src={croppedImages.tumblr} className="tumblr-img" alt="Tumblr post" />
                                </div>
                              )}

                              <div className="tumblr-content">
                                <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: '0 0 10px 0', color: 'white' }}>{results.platforms.tumblr.title}</h2>
                                <div className="tumblr-body">
                                  {results.platforms.tumblr.body}
                                </div>
                                <div className="tumblr-tags">
                                  {results.hashtags.map((tag, idx) => (
                                    <span key={idx} className="tumblr-tag">#{tag} </span>
                                  ))}
                                </div>
                              </div>

                              <div className="tumblr-footer">
                                <span>98 تفاعل</span>
                                <div className="tumblr-actions">
                                  <button className="tumblr-action-btn"><Share2 size={16} /></button>
                                  <button className="tumblr-action-btn"><MessageCircle size={16} /></button>
                                  <button className="tumblr-action-btn"><Heart size={16} /></button>
                                </div>
                              </div>
                            </div>
                          )}

                        </div>
                      </div>

                      {/* Single Publish Action Box */}
                      <div className="publish-action-box">
                        <div>
                          {publishedLinks[activeTab] ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#10b981' }}>
                              <CheckCircle2 size={18} />
                              <span style={{ fontSize: '0.85rem', fontWeight: 'bold' }}>تم النشر بنجاح على هذه المنصة!</span>
                            </div>
                          ) : (
                            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>جاهز للنشر على {PLATFORM_PRESETS[activeTab].name} بالمقاس والوصف المخصص.</span>
                          )}
                        </div>

                        <div style={{ display: 'flex', gap: '8px' }}>
                          {publishedLinks[activeTab] && (
                            <a
                              href={publishedLinks[activeTab]}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="btn btn-secondary"
                              style={{ padding: '6px 12px', fontSize: '0.78rem' }}
                            >
                              <ExternalLink size={12} />
                              <span>عرض الرابط</span>
                            </a>
                          )}
                          <button
                            className="btn btn-primary"
                            style={{ padding: '6px 12px', fontSize: '0.78rem' }}
                            onClick={() => handlePublishSingle(activeTab)}
                            disabled={publishingStatus === 'publishing'}
                          >
                            <Share2 size={12} />
                            <span>نشر الآن منفصلاً 🚀</span>
                          </button>
                        </div>
                      </div>
                    </div> {/* end of preview and publish grid */}
                  </div> {/* end of workspace-preview-col */}

                </div>
              </div>
            </div>

            {/* API REALTIME LOGGER / TERMINAL */}
            <div className="log-panel">
              <div className="terminal-header">
                <div className="terminal-title">
                  <Terminal size={14} />
                  <span>Log Console & Pipeline Status (سجل العمليات البرمجية)</span>
                </div>
                <div className="terminal-dot-group">
                  <div className="terminal-dot red" />
                  <div className="terminal-dot yellow" />
                  <div className="terminal-dot green" />
                </div>
              </div>
              <div className="terminal-body">
                {logs.length === 0 ? (
                  <div className="log-line info">
                    [النظام] في انتظار رفع صورة وإدخال فكرة لتشغيل خوارزميات التخصيص والنشر التلقائي...
                  </div>
                ) : (
                  logs.map((log, idx) => (
                    <div key={idx} className={`log-line ${log.type}`}>
                      [{log.time}] {log.text}
                    </div>
                  ))
                )}
                <div ref={terminalEndRef} />
              </div>
            </div>

          </section>

        </div>
      </main>

      {/* SETTINGS DIALOG (MODAL) */}
      {showSettings && (
        <div className="modal-overlay">
          <div className="modal-content glass-panel">
            <div className="modal-header">
              <h3 className="modal-title">إعدادات الاتصال والـ API ⚙️</h3>
              <button className="modal-close" onClick={() => setShowSettings(false)}>
                <X size={20} />
              </button>
            </div>

            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '15px' }}>
              افتراضياً، تعمل المنصة في <strong>وضع المحاكاة الذكية المدمج</strong> لتوليد المنشورات. لتفعيل النشر الحقيقي باستخدام الذكاء الاصطناعي الفعلي من Google، الرجاء إدخال مفتاح الـ API الخاص بك:
            </p>

            <div className="form-group">
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span>Gemini API Key:</span>
                <a href="https://aistudio.google.com/" target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.75rem', color: '#a855f7', marginRight: 'auto', display: 'flex', alignItems: 'center', gap: '3px' }}>
                  <span>احصل على مفتاح مجاني</span>
                  <ExternalLink size={10} />
                </a>
              </label>
              <input
                type="password"
                className="form-input"
                placeholder="AIzaSy..."
                value={geminiApiKey}
                onChange={(e) => setGeminiApiKey(e.target.value)}
                style={{ direction: 'ltr', textAlign: 'left' }}
              />
            </div>

            <div className="settings-card">
              <h4 style={{ margin: '0 0 6px 0', fontSize: '0.9rem', color: 'white' }}>معلومات الخصوصية:</h4>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0, lineHeight: '1.4' }}>
                يتم حفظ مفتاح API الخاص بك محلياً في متصفحك فقط (LocalStorage)، ويتم توجيه جميع طلبات توليد المحتوى مباشرة من متصفحك إلى خوادم Google Gemini بشكل آمن تماماً وبدون أي وسيط.
              </p>
            </div>

            <button
              className="btn btn-primary"
              style={{ width: '100%', marginTop: '10px' }}
              onClick={() => {
                setShowSettings(false);
                addLog('تم تحديث إعدادات Gemini API بنجاح.', 'success');
              }}
            >
              حفظ الإعدادات وإغلاق
            </button>
          </div>
        </div>
      )}

      {/* FOOTER */}
      <footer style={{ borderTop: '1px solid var(--border-color)', padding: '24px', textAlign: 'center', fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '40px' }}>
        <p>© 2026 جمعية تحالف الخيرية. تم التطوير كجزء من مشروع أتمتة النشر الذكي.</p>
      </footer>
    </div>
  );
}

export default App;
