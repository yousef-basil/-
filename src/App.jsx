import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles, Upload, Trash2, RotateCw, RefreshCw, Settings,
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

const ORGANIZATION_NAME = 'جمعية التحالف للإغاثة والتنمية';
const TAHALUF_LOGO_URL = `${import.meta.env.BASE_URL}Full-Color-ArEn-H-1536x306.png`;
const OPENAI_MODEL = 'gpt-4o-mini';
const GEMINI_MODEL = 'gemini-2.5-flash';

const detectProviderFromKey = (key = '') => {
  const trimmed = key.trim();
  return trimmed.startsWith('sk-') ? 'openai' : 'gemini';
};

const getProviderMeta = (provider) => {
  if (provider === 'openai') {
    return {
      name: 'OpenAI',
      statusLabel: 'OpenAI API',
      inputLabel: 'OpenAI API Key:',
      placeholder: 'sk-...',
      helpHref: 'https://platform.openai.com/api-keys',
      helpText: 'احصل على مفتاح OpenAI'
    };
  }

  return {
    name: 'Gemini',
    statusLabel: 'Gemini API',
    inputLabel: 'Gemini API Key:',
    placeholder: 'AIzaSy...',
    helpHref: 'https://aistudio.google.com/',
    helpText: 'احصل على مفتاح Gemini'
  };
};

const buildHumanitarianGenerationPrompt = (sourceText, toneLabel) => `
أنت كاتب محتوى إنساني متمرس تعمل لصالح ${ORGANIZATION_NAME}.
الجمعية تعمل ميدانيًا في قطاع غزة وتركز على الإغاثة العاجلة والتنمية المستدامة ودعم الأسر المتضررة والنازحة من خلال برامج متعددة تشمل: الغذاء، المياه النظيفة، الدواء والرعاية الصحية، الإيواء والمأوى، الدعم التعليمي للأطفال، والدعم النفسي والاجتماعي.

## مهمتك:
حوّل النص أو الفكرة التالية إلى محتوى جاهز للنشر على منصات التواصل الاجتماعي، بلغة عربية إنسانية رصينة ومقنعة وواضحة، تحترم كرامة المستفيدين وتبني ثقة المتابعين والداعمين.

=== النص أو الفكرة الأصلية ===
"${sourceText}"
=== نهاية النص ===

النبرة المطلوبة: "${toneLabel}"

## قواعد إلزامية صارمة:
1. اكتب بما يليق بجمعية إنسانية تعمل في ظروف استثنائية بغزة — لا بأسلوب صفحات التسويق أو الترفيه.
2. احفظ كرامة المستفيدين تمامًا: لا تصوّرهم كحالات مجردة، ولا تستخدم لغة استعراضية أو ابتزازًا عاطفيًا رخيصًا.
3. تجنب تمامًا عبارات مثل: "صادم"، "لن تصدق"، "ترند"، "فيروسي"، "فضيحة"، "كارثة لا توصف"، "عاجل" (إلا إذا كان الموقف فعلًا طارئًا مذكورًا في النص).
4. لا تخترع أرقامًا أو أسماء أو مواقع أو تفاصيل ميدانية أو قصصًا غير موجودة في النص الأصلي.
5. إذا كانت المعلومات ناقصة، استخدم صياغة عامة صادقة دون اختلاق أي تفاصيل.
6. ركّز على: الاحتياج الإنساني الحقيقي، أثر الدعم والتبرع، الشفافية والمصداقية، والأولوية الميدانية.
7. استخدم دعوات عمل محترمة وإنسانية مثل: "ساهم"، "ادعم"، "شارك"، "انشر"، "كن عونًا"، "لا تتردد في المساهمة".
8. لا تضف رابط تبرع أو وسيلة تواصل من عندك إلا إذا كانت مذكورة في النص الأصلي.
9. اللغة: فصحى سلسة وقريبة من الناس، مع مسحة وجدانية هادئة ودافئة.
10. تجنب كل خطاب سياسي أو تحريضي أو ادعاءات غير موثقة.
11. يمكنك الإشارة إلى سياق غزة (النزوح، شح الغذاء والماء والدواء، تأثر التعليم) إذا كان ذلك منسجمًا مع النص الأصلي أو طبيعة العمل الإنساني، لكن دون مبالغة أو تهويل.
12. استخدم الإيموجي باعتدال شديد (1-3 لكل منشور) — اختر إيموجي يعبّر عن التضامن والأمل وليس الترفيه.
13. الهاشتاقات يجب أن تكون ذات صلة بالعمل الإنساني وغزة، وليست هاشتاقات ترند عشوائية.

## إرشادات تفصيلية لكل منصة:

### X (تويتر):
- منشور مختصر وواضح بين 170 و240 حرفًا.
- ابدأ بجملة إنسانية مباشرة تلخص الفكرة أو الحاجة.
- 1-2 هاشتاغ فقط، ذات صلة حقيقية بالموضوع.
- ختام بدعوة بسيطة للدعم أو النشر.
- تجنب أسلوب "الخطاف الصادم" — استخدم بدلاً منه جملة صادقة ومؤثرة.

### Pinterest:
- عنوان وصفي واضح يشرح المشروع أو الحالة (40-60 حرفًا).
- وصف هادئ ومهني (200-300 حرف) يشرح الفكرة أو المشروع ويوضح كيف يساهم الدعم في التغيير.
- لا تستخدم لغة إعلانية مبالغة — ركز على الوصف الإنساني الواقعي.
- 2-3 هاشتاقات.

### Threads:
- أسلوب حواري إنساني دافئ من 2-4 فقرات قصيرة (300-450 حرفًا).
- ابدأ بتقديم الموضوع بلغة قريبة من الناس.
- في الوسط، اشرح الحاجة أو المشروع بوضوح.
- اختم بسؤال تأمّلي لطيف أو دعوة للمشاركة إن كان مناسبًا.
- 2-3 هاشتاقات.

### Tumblr:
- عنوان قصصي واضح يعبّر عن جوهر الموضوع.
- نص مفصل (500-900 حرف) بأسلوب سردي أو تفسيري.
- قسّم النص لفقرات مريحة للقراءة.
- اشرح السياق والحاجة وأثر الدعم بصدق وكرامة.
- اختم بخاتمة تدعو للتفكير أو المساهمة بأسلوب راقٍ.
- 2-4 هاشتاقات.

## شكل الإخراج:
أعد النتيجة فقط بصيغة JSON صالحة، بدون أي نص خارج JSON وبدون علامات Markdown:
{
  "enhancedText": "ملخص إنساني واضح ومهني للنص الأصلي يصلح كنص رئيسي",
  "platforms": {
    "x": {
      "caption": "منشور إنساني مناسب لمنصة X (170-240 حرف)"
    },
    "pinterest": {
      "title": "عنوان وصفي مناسب لـ Pinterest",
      "description": "وصف إنساني مناسب لـ Pinterest (200-300 حرف)"
    },
    "threads": {
      "caption": "منشور حواري إنساني مناسب لـ Threads (300-450 حرف)"
    },
    "tumblr": {
      "title": "عنوان قصصي مناسب لـ Tumblr",
      "body": "نص مفصل إنساني مناسب لـ Tumblr (500-900 حرف)"
    }
  },
  "hashtags": ["3-5 هاشتاقات ذات صلة بالعمل الإنساني وغزة"]
}
`;

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
  const [apiKey, setApiKey] = useState(() => {
    return localStorage.getItem('tahaluf_ai_key') || localStorage.getItem('tahaluf_gemini_key') || '';
  });
  const [apiProvider, setApiProvider] = useState(() => {
    const storedProvider = localStorage.getItem('tahaluf_ai_provider');

    if (storedProvider === 'openai' || storedProvider === 'gemini') {
      return storedProvider;
    }

    const legacyKey = localStorage.getItem('tahaluf_ai_key') || localStorage.getItem('tahaluf_gemini_key') || '';
    return legacyKey ? detectProviderFromKey(legacyKey) : 'openai';
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
    enhancedText: `اكتب فكرة المشروع أو الحالة الإنسانية في غزة، ثم اضغط على زر التوليد الذكي للحصول على نصوص تناسب ${ORGANIZATION_NAME}.`,
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

  // Initialize API credentials in localStorage
  useEffect(() => {
    localStorage.setItem('tahaluf_ai_key', apiKey);
  }, [apiKey]);

  useEffect(() => {
    localStorage.setItem('tahaluf_ai_provider', apiProvider);
  }, [apiProvider]);

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

  const providerMeta = getProviderMeta(apiProvider);

  const handleApiKeyChange = (value) => {
    setApiKey(value);

    const trimmed = value.trim();
    if (trimmed.startsWith('sk-')) {
      setApiProvider('openai');
    } else if (trimmed.startsWith('AIza')) {
      setApiProvider('gemini');
    }
  };

  const trackOpenAIUsage = (usage) => {
    if (!usage) return;

    const promptTokens = usage.prompt_tokens || 0;
    const completionTokens = usage.completion_tokens || 0;
    const total = usage.total_tokens || (promptTokens + completionTokens);
    const cost = (promptTokens * 0.15 + completionTokens * 0.60) / 1000000;

    setLastCost(cost);
    setTotalCost(prev => prev + cost);
    setTotalTokens(prev => prev + total);
    addLog(`استهلاك الرموز: ${total} رمز (التكلفة: $${cost.toFixed(5)})`, 'info');
  };

  const trackGeminiUsage = (usageMetadata) => {
    if (!usageMetadata) return;

    const promptTokens = usageMetadata.promptTokenCount || 0;
    const completionTokens = usageMetadata.candidatesTokenCount || 0;
    const total = usageMetadata.totalTokenCount || (promptTokens + completionTokens);
    const cost = (promptTokens * 0.075 + completionTokens * 0.30) / 1000000;

    setLastCost(cost);
    setTotalCost(prev => prev + cost);
    setTotalTokens(prev => prev + total);
    addLog(`استهلاك الرموز: ${total} رمز (التكلفة: $${cost.toFixed(5)})`, 'info');
  };

  const extractApiErrorMessage = async (response) => {
    try {
      const errData = await response.json();
      return errData.error?.message || errData.message || response.statusText;
    } catch {
      return response.statusText;
    }
  };

  const normalizeGeneratedObject = (generatedObj, sourceName) => {
    const hasExpectedShape = generatedObj?.enhancedText
      && generatedObj?.platforms?.x?.caption
      && generatedObj?.platforms?.pinterest?.title
      && generatedObj?.platforms?.pinterest?.description
      && generatedObj?.platforms?.threads?.caption
      && generatedObj?.platforms?.tumblr?.title
      && generatedObj?.platforms?.tumblr?.body;

    if (!hasExpectedShape) {
      throw new Error(`الاستجابة القادمة من ${sourceName} لا تطابق صيغة JSON المطلوبة.`);
    }

    return generatedObj;
  };

  const applyGeneratedResults = (generatedObj) => {
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
  };

  const generateWithProvider = async (promptText) => {
    if (apiProvider === 'openai') {
      addLog(`تم اختيار ${providerMeta.name}. جاري الاتصال بخوادم OpenAI...`, 'info');
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey.trim()}`
        },
        body: JSON.stringify({
          model: OPENAI_MODEL,
          messages: [{
            role: 'user',
            content: promptText
          }],
          response_format: { type: 'json_object' }
        })
      });

      if (!response.ok) {
        const errMessage = await extractApiErrorMessage(response);
        throw new Error(`خطأ في استجابة OpenAI API: ${errMessage}`);
      }

      const data = await response.json();
      const jsonText = data.choices?.[0]?.message?.content;

      if (!jsonText) {
        throw new Error('لم يرجع OpenAI محتوى نصيًا صالحًا.');
      }

      trackOpenAIUsage(data.usage);
      return normalizeGeneratedObject(JSON.parse(jsonText), 'OpenAI');
    }

    addLog(`تم اختيار ${providerMeta.name}. جاري الاتصال بخوادم Google AI...`, 'info');
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey.trim()}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: promptText
          }]
        }],
        generationConfig: {
          responseMimeType: 'application/json'
        }
      })
    });

    if (!response.ok) {
      const errMessage = await extractApiErrorMessage(response);
      throw new Error(`خطأ في استجابة Gemini API: ${errMessage}`);
    }

    const data = await response.json();
    const jsonText = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!jsonText) {
      throw new Error('لم يرجع Gemini محتوى نصيًا صالحًا.');
    }

    trackGeminiUsage(data.usageMetadata);
    return normalizeGeneratedObject(JSON.parse(jsonText), 'Gemini');
  };

  const renderPlatformMedia = (platform, className, alt) => {
    if (!imageSrc) return null;

    if (mediaType === 'video') {
      return (
        <video
          src={imageSrc}
          className={className}
          controls
          muted
          playsInline
          preload="metadata"
        />
      );
    }

    if (!croppedImages[platform]) return null;

    return <img src={croppedImages[platform]} className={className} alt={alt} />;
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
    e.target.value = '';
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

    if (apiKey.trim()) {
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

        const humanitarianPrompt = buildHumanitarianGenerationPrompt(textPrompt, toneLabels[tone]);
        const generatedObj = await generateWithProvider(humanitarianPrompt);

        applyGeneratedResults(generatedObj);
        addLog(`تم تحليل وتحديث النصوص بنجاح لكل المنصات باستخدام ${providerMeta.name}!`, 'success');
        addLog('تم الانتهاء من المعالجة بنجاح! تحقق من المعاينة الحية.', 'success');
      } catch (err) {
        addLog(`تعذر إكمال الطلب عبر ${providerMeta.name}: ${err.message}`, 'error');
        addLog('لم يتم التحويل تلقائياً إلى المحاكاة حتى يبقى واضحاً أنك تعمل على مزود حقيقي. يمكنك تصحيح المفتاح أو تغيير المزود من الإعدادات.', 'warning');
      } finally {
        setIsProcessing(false);
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

  const runGazaSmartMockFallback = () => {
    addLog('جاري صياغة محتوى إنساني مناسب لسياق غزة باستخدام المحاكاة المحلية...', 'info');

    let enhanced = '';
    let xCap = '';
    let pinTitle = '';
    let pinDesc = '';
    let thCap = '';
    let tumTitle = '';
    let tumBody = '';
    let tags = [];

    const lowerPrompt = textPrompt.toLowerCase();
    const hasAny = (keywords) => keywords.some((keyword) => lowerPrompt.includes(keyword));

    const isRamadan = hasAny(['رمضان', 'إفطار', 'سلة', 'طرود', 'طرد غذائي']);
    const isMedical = hasAny(['دواء', 'علاج', 'مريض', 'مرضى', 'طبي', 'مستشفى', 'عملية']);
    const isShelter = hasAny(['خيمة', 'إيواء', 'بطانية', 'فرشات', 'مأوى', 'نزوح', 'نازح', 'نازحين']);
    const isChildren = hasAny(['طفل', 'أطفال', 'يتيم', 'أيتام', 'تعليم', 'حقيبة', 'مدرسة']);
    const isBasicNeeds = hasAny(['غزة', 'غزه', 'ماء', 'مياه', 'غذاء', 'طعام', 'خبز', 'كوبون', 'قسيمة', 'إغاثة', 'اغاثة']);

    if (isRamadan) {
      enhanced = `منشور إنساني يوضح أهمية دعم الأسر المتضررة والنازحة في غزة خلال شهر رمضان عبر توفير الغذاء ووجبات الإفطار بطريقة تحفظ الكرامة وتخفف وطأة الظروف المعيشية.`;
      xCap = `في غزة، يحمل رمضان معه احتياجًا مضاعفًا للأسر النازحة والمتضررة. دعمكم عبر ${ORGANIZATION_NAME} يساعد في توفير الغذاء ووجبات الإفطار لمن هم أشد حاجة. #غزة #رمضان`;
      pinTitle = 'دعم الغذاء ووجبات الإفطار للأسر المتضررة في غزة';
      pinDesc = `يسهم دعمكم عبر ${ORGANIZATION_NAME} في توفير سلال غذائية ووجبات إفطار للأسر المتضررة والنازحة في غزة، بما يخفف عنها أعباء المعيشة خلال شهر رمضان ويحفظ كرامتها في هذا الوقت الصعب.`;
      thCap = `في غزة، لا يتعلق رمضان بالمائدة فقط، بل بالقدرة على تأمين الحد الأدنى من الغذاء للأسر المتضررة. مساهمتكم مع ${ORGANIZATION_NAME} تساعد في الوصول إلى من هم أشد احتياجًا. ما أكثر ما ترونه أولوية في هذا الوقت: الطرود الغذائية أم وجبات الإفطار؟`;
      tumTitle = 'كيف يخفف دعم الغذاء في رمضان العبء عن الأسر المتضررة في غزة؟';
      tumBody = `تواجه كثير من الأسر المتضررة والنازحة في غزة صعوبة يومية في تأمين الاحتياجات الغذائية الأساسية، ويزداد هذا العبء في شهر رمضان. من خلال برامج ${ORGANIZATION_NAME} يمكن توجيه الدعم إلى مجالات عملية مثل الطرود الغذائية ووجبات الإفطار، بما يخفف من الأثر المعيشي ويحفظ كرامة الأسر. هذا النوع من الدعم لا يقتصر على سد حاجة آنية، بل يمنح الأسر مساحة من الطمأنينة وسط ظروف قاسية ومتقلبة.`;
      tags = ['غزة', 'رمضان', 'دعم_الأسر', 'إغاثة'];
    } else if (isMedical) {
      enhanced = `منشور مهني يشرح حاجة المرضى والأسر المتضررة في غزة إلى دعم صحي عاجل ومسؤول، مع التركيز على توفير الدواء والفحوصات والخدمات الطبية الأساسية دون مبالغة أو استغلال.`;
      xCap = `في غزة، يواجه مرضى كثر صعوبة في الوصول إلى الدواء والخدمات الطبية الأساسية. دعمكم عبر ${ORGANIZATION_NAME} يساعد في تخفيف هذا العبء عن الأسر المتضررة. #غزة #دعم_صحي`;
      pinTitle = 'دعم الدواء والخدمات الطبية للأسر المتضررة في غزة';
      pinDesc = `يساعد دعمكم ${ORGANIZATION_NAME} في الوصول إلى المرضى والأسر المتضررة في غزة من خلال المساهمة في توفير الدواء والفحوصات والاحتياجات الطبية الأساسية بحسب الإمكان والأولوية الميدانية.`;
      thCap = `في غزة، التحدي الصحي لا يتعلق بالعلاج وحده، بل بإمكانية الوصول إلى الدواء والفحوصات الأساسية في الوقت المناسب. مساهمتكم مع ${ORGANIZATION_NAME} قد تخفف عبئًا حقيقيًا عن أسرة كاملة. ما نوع الدعم الصحي الذي ترونه أكثر إلحاحًا اليوم؟`;
      tumTitle = 'لماذا يبقى الدعم الصحي أولوية للأسر المتضررة في غزة؟';
      tumBody = `في ظل الضغط المتواصل على الحياة اليومية في غزة، يصبح الوصول إلى الدواء والفحوصات والخدمات الطبية الأساسية عبئًا كبيرًا على كثير من الأسر المتضررة. يهدف الدعم الذي تقدمه ${ORGANIZATION_NAME} إلى المساهمة في تخفيف هذا العبء بما يتوافق مع الأولويات الميدانية والقدرات المتاحة. عندما يتوفر الدواء أو الفحص في الوقت المناسب، فإن ذلك لا ينعكس على المريض فقط، بل ينعكس على استقرار الأسرة كلها وقدرتها على الاستمرار.`;
      tags = ['غزة', 'دعم_صحي', 'دواء', 'إغاثة'];
    } else if (isShelter) {
      enhanced = `محتوى إنساني يوضح أثر دعم الإيواء والمستلزمات الأساسية للأسر النازحة في غزة، مع إبراز الاحتياج بصورة محترمة تبني الثقة وتوضح الأولوية.`;
      xCap = `النزوح في غزة لا يعني فقدان المكان فقط، بل فقدان كثير من الاحتياجات الأساسية المرتبطة بالحياة اليومية. دعمكم عبر ${ORGANIZATION_NAME} يساعد في تلبية احتياجات الإيواء العاجلة للأسر النازحة. #غزة #إيواء`;
      pinTitle = 'دعم الإيواء والمستلزمات الأساسية للأسر النازحة في غزة';
      pinDesc = `تسهم المساندة عبر ${ORGANIZATION_NAME} في توفير احتياجات مرتبطة بالإيواء للأسر النازحة في غزة، مثل المستلزمات الأساسية التي تساعدها على مواجهة ظروف النزوح بقدر أكبر من الاستقرار والكرامة.`;
      thCap = `حين تضطر الأسرة إلى النزوح، لا تحتاج إلى مأوى فقط، بل إلى تفاصيل يومية كثيرة تحفظ الحد الأدنى من الاستقرار. في غزة، يمكن للدعم الموجّه أن يخفف هذا العبء عن الأسر النازحة. برأيكم، ما أكثر ما تحتاجه الأسرة مباشرة بعد النزوح؟`;
      tumTitle = 'كيف يخفف دعم الإيواء العبء عن الأسر النازحة في غزة؟';
      tumBody = `تضع تجربة النزوح الأسر أمام احتياجات متسارعة لا تتوقف عند مكان الإقامة، بل تمتد إلى كل ما يلزم للحياة اليومية بكرامة. من هنا تأتي أهمية برامج الإيواء والمستلزمات الأساسية التي تعمل ${ORGANIZATION_NAME} على دعمها للأسر النازحة في غزة بحسب الأولوية والقدرة الميدانية. هذا النوع من التدخل لا يحل كل شيء، لكنه يمنح الأسرة مساحة أولية من الأمان والقدرة على تنظيم يومها في ظرف شديد القسوة.`;
      tags = ['غزة', 'إيواء', 'النازحين', 'دعم_الأسر'];
    } else if (isChildren) {
      enhanced = `منشور إنساني مناسب لجمعية تعمل في غزة يركز على حماية الأطفال ودعم احتياجاتهم التعليمية أو المعيشية بلغة هادئة تحفظ الكرامة وتبتعد عن الاستغلال.`;
      xCap = `الأطفال في غزة يحتاجون إلى دعم يحفظ كرامتهم ويساعد أسرهم على الاستمرار، سواء في التعليم أو الاحتياجات الأساسية. مساهمتكم عبر ${ORGANIZATION_NAME} تصنع أثرًا هادئًا لكنه حقيقي. #غزة #دعم_الأطفال`;
      pinTitle = 'دعم الأطفال والأسر المتضررة في غزة';
      pinDesc = `يساعد دعمكم ${ORGANIZATION_NAME} في مساندة الأطفال والأسر المتضررة في غزة عبر تدخلات إنسانية تراعي الاحتياج وتحفظ الكرامة، سواء في المستلزمات التعليمية أو الضروريات الأساسية بحسب الأولوية.`;
      thCap = `حين نتحدث عن الأطفال في غزة، فنحن لا نتحدث عن احتياج عابر، بل عن حقهم في قدر من الأمان والرعاية والاستمرار. مساهمتكم مع ${ORGANIZATION_NAME} تدعم الأسر في تلبية احتياجات أبنائها بطريقة تحفظ كرامتهم. ما الدعم الذي تعتقدون أنه الأهم للأطفال اليوم؟`;
      tumTitle = 'دعم الأطفال في غزة يبدأ بدعم الأسرة من حولهم';
      tumBody = `الأطفال هم أول من يتأثر بالظروف الصعبة، لكن الاستجابة لاحتياجاتهم لا تكون فقط عبر مخاطبتهم كحالات فردية، بل عبر دعم الأسرة التي تحيط بهم وتتحمل مسؤولية رعايتهم كل يوم. لهذا تعمل ${ORGANIZATION_NAME} على توجيه تدخلاتها بما يساعد الأسر المتضررة في غزة على تلبية احتياجات أبنائها الأساسية والتعليمية والإنسانية بحسب ما يتوفر من إمكانات وأولويات. هذا النهج يحافظ على الكرامة ويجعل الدعم أكثر استدامة وواقعية.`;
      tags = ['غزة', 'دعم_الأطفال', 'تعليم', 'إغاثة'];
    } else if (isBasicNeeds) {
      enhanced = `منشور إنساني يركز على الاحتياجات الأساسية للأسر المتضررة في غزة، ويشرح كيف يساهم الدعم في تخفيف العبء اليومي عنها بصورة واضحة ومسؤولة.`;
      xCap = `في غزة، ما تزال أسر كثيرة تواجه صعوبة في تأمين احتياجاتها الأساسية يومًا بيوم. دعمكم عبر ${ORGANIZATION_NAME} يساعد في الوصول إلى الأسر الأشد حاجة بما يحفظ كرامتها. #غزة #دعم_الأسر`;
      pinTitle = 'دعم الاحتياجات الأساسية للأسر المتضررة في غزة';
      pinDesc = `تسعى ${ORGANIZATION_NAME} إلى مساندة الأسر المتضررة في غزة عبر دعم الاحتياجات الأساسية مثل الغذاء والمياه والمستلزمات اليومية، بما يخفف العبء المعيشي ويمنح الأسرة قدرًا من الاستقرار والكرامة.`;
      thCap = `في غزة، الاحتياج لا يختصر في بند واحد. هناك أسر تحتاج دعماً يومياً يخفف عبء الغذاء والمياه والمستلزمات الأساسية. مساهمتكم مع ${ORGANIZATION_NAME} تصنع فرقاً عملياً، حتى لو بدا بسيطاً. ما أكثر أولوية إنسانية ترونها اليوم؟`;
      tumTitle = 'لماذا يبقى دعم الاحتياجات الأساسية أولوية في غزة؟';
      tumBody = `الحديث عن الاحتياجات الأساسية في غزة لا يعني فقط الغذاء أو المياه، بل يعني قدرة الأسرة على الاستمرار يومًا آخر بقدر من الكرامة والاستقرار. تعمل ${ORGANIZATION_NAME} على توجيه الدعم نحو الأولويات الأكثر إلحاحًا بحسب ما تتيحه الظروف الميدانية، سواء في الغذاء أو المستلزمات اليومية أو ما يخفف أثر النزوح والضغط المعيشي. حين يكون الدعم واضح الهدف ومحترم اللغة، فإنه يبني الثقة ويصل إلى حيث يجب أن يصل.`;
      tags = ['غزة', 'الاحتياجات_الأساسية', 'إغاثة', 'دعم_الأسر'];
    } else {
      enhanced = `صياغة إنسانية مناسبة لجمعية تعمل في غزة، تشرح الفكرة أو المشروع بلغة مهنية هادئة تركز على الاحتياج والأثر وتحافظ على كرامة المستفيدين.`;
      xCap = `تواصل ${ORGANIZATION_NAME} العمل إلى جانب الأسر المتضررة في غزة عبر تدخلات إنسانية تستجيب للاحتياج بحسب الأولوية والقدرة. دعمكم ومشاركتكم يساهمان في توسيع هذا الأثر. #غزة #إغاثة`;
      pinTitle = 'مبادرة إنسانية لدعم الأسر المتضررة في غزة';
      pinDesc = `يعرض هذا المشروع جانبًا من جهود ${ORGANIZATION_NAME} في مساندة الأسر المتضررة في غزة عبر تدخلات إنسانية عملية تراعي الأولوية الميدانية وتستهدف تخفيف أثر الظروف الصعبة على الحياة اليومية.`;
      thCap = `وراء كل مشروع إنساني في غزة تفاصيل كثيرة تتعلق بالاحتياج الحقيقي، والأولويات، والقدرة على الوصول. لهذا تحرص ${ORGANIZATION_NAME} على أن يكون الدعم موجهاً وعملياً بقدر الإمكان. برأيكم، ما الذي يجعل المنشور الإنساني أكثر صدقًا وتأثيرًا؟`;
      tumTitle = 'كيف يمكن للمحتوى الإنساني أن يخدم الأسر المتضررة في غزة بصدق؟';
      tumBody = `حين يكون المحتوى الإنساني صادقًا ومحترمًا، فإنه لا يكتفي بطلب التعاطف، بل يشرح الاحتياج ويوضح الأثر ويدعو إلى المساندة بطريقة تبني الثقة. هذا ما تسعى إليه ${ORGANIZATION_NAME} في عرض مشاريعها ورسائلها المتعلقة بالأسر المتضررة في غزة، بحيث يبقى المستفيد في مركز الرسالة بوصفه إنسانًا له كرامته، لا مجرد وسيلة لإثارة الانتباه.`;
      tags = ['غزة', 'إغاثة', 'دعم_الأسر', 'تنمية'];
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

    addLog('تمت صياغة منشورات مناسبة لسياق غزة لكل المنصات.', 'success');
    addLog('تم تحديث الهاشتاغات بنبرة أكثر مهنية وارتباطاً بالعمل الإنساني.', 'success');
    addLog('تم الانتهاء من المعالجة الذكية الخاصة بغزة. تحقق من المعاينة الحية في اليسار.', 'success');
    setIsProcessing(false);
  };

  const handleGazaAIGenerate = async () => {
    if (!textPrompt.trim()) {
      addLog('تنبيه: الرجاء إدخال فكرة أو نص المنشور أولاً للتوليد.', 'warning');
      return;
    }

    setIsProcessing(true);
    setLogs([]);
    addLog('بدء توليد محتوى إنساني مناسب لجمعية تعمل في غزة...', 'info');

    const toneLabels = {
      auto: 'اختر تلقائياً النبرة الأنسب لسياق جمعية إنسانية تعمل في غزة، مع تقديم نص رصين، دافئ، وموثوق.',
      campaign: 'دعوة إنسانية واضحة للمساهمة والدعم، بلغة رحيمة ومحترمة بعيدة عن المبالغة.',
      report: 'تقرير ميداني شفاف يوضح الاحتياج أو الأثر بلغة دقيقة تبني الثقة.',
      story: 'سرد إنساني هادئ يحافظ على كرامة المستفيدين ويشرح الأثر دون استغلال عاطفي.',
      volunteer: 'دعوة مجتمعية للتطوع والمساندة بروح تعاون ومسؤولية.',
      education: 'محتوى توعوي يشرح الواقع الإنساني والأولويات في غزة بلغة مفهومة ومتزنة.'
    };

    const generationPrompt = buildHumanitarianGenerationPrompt(textPrompt, toneLabels[tone]);

    if (!apiKey.trim()) {
      addLog('لم يتم إدخال مفتاح API. تفعيل المحاكاة المحلية الخاصة بسياق غزة...', 'info');
      setTimeout(() => {
        runGazaSmartMockFallback();
      }, 1000);
      return;
    }

    try {
      const generatedObj = await generateWithProvider(generationPrompt);

      applyGeneratedResults(generatedObj);
      addLog(`تم توليد نصوص مناسبة لسياق غزة باستخدام ${providerMeta.name}.`, 'success');
      addLog('تم الانتهاء من المعالجة الخاصة بغزة بنجاح. تحقق من المعاينة الحية.', 'success');
    } catch (err) {
      addLog(`تعذر إكمال الطلب عبر ${providerMeta.name}: ${err.message}`, 'error');
      addLog('لم يتم التحويل تلقائياً إلى المحاكاة المحلية حتى يبقى سبب الفشل واضحاً. صحح المفتاح أو غيّر المزود من الإعدادات ثم أعد المحاولة.', 'warning');
    } finally {
      setIsProcessing(false);
    }
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
            <img
              src={TAHALUF_LOGO_URL}
              alt="جمعية التحالف للإغاثة والتنمية"
              className="brand-logo"
            />
          </div>

          <div className="header-actions">
            {apiKey && (
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

            <div className={`api-status-badge ${apiKey ? '' : 'disconnected'}`}>
              {apiKey ? (
                <>
                  <CheckCircle2 size={16} />
                  <span>مُعدّ لاستخدام {providerMeta.statusLabel}</span>
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
                <label className="form-label">اكتب فكرة الحملة أو الصق المقال بالكامل بصياغة تناسب غزة:</label>
                <textarea
                  className="form-textarea"
                  style={{ minHeight: '140px' }}
                  value={textPrompt}
                  onChange={(e) => setTextPrompt(e.target.value)}
                  placeholder="اكتب تفاصيل الحالة أو المشروع في غزة هنا: من الفئة المستفيدة؟ ما نوع الاحتياج؟ ما الأولوية الآن؟ وما الأثر المتوقع من الدعم؟ كلما كان الوصف أوضح، جاءت النتائج أكثر مهنية وملاءمة للجمعية."
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
                onClick={handleGazaAIGenerate}
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
                  {mediaType === 'video' ? (
                    <video
                      src={imageSrc}
                      className="file-preview-thumb"
                      muted
                      loop
                      autoPlay
                      playsInline
                      preload="metadata"
                    />
                  ) : (
                    <img src={imageSrc} alt="Preview" className="file-preview-thumb" />
                  )}
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
                              {(mediaType === 'video' || croppedImages.x) && (
                                <div className="x-media-box">
                                  {renderPlatformMedia('x', 'x-media', 'X media preview')}
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
                                  {renderPlatformMedia('pinterest', 'pin-img', 'Pinterest pin')}
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
                                  {(mediaType === 'video' || croppedImages.threads) && (
                                    <div className="threads-media">
                                      {renderPlatformMedia('threads', 'threads-media-asset', 'Threads media preview')}
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

                              {(mediaType === 'video' || croppedImages.tumblr) && (
                                <div className="tumblr-media-container">
                                  {renderPlatformMedia('tumblr', 'tumblr-img', 'Tumblr media preview')}
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
              افتراضياً، تعمل المنصة في <strong>وضع المحاكاة الذكية المدمج</strong>. لتفعيل التوليد الحقيقي، اختر المزود ثم أدخل مفتاح الـ API الخاص بك:
            </p>

            <div className="form-group">
              <label className="form-label">
                <span>مزود الذكاء الاصطناعي:</span>
              </label>
              <select
                className="form-input"
                value={apiProvider}
                onChange={(e) => setApiProvider(e.target.value)}
              >
                <option value="openai">OpenAI</option>
                <option value="gemini">Google Gemini</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span>{providerMeta.inputLabel}</span>
                <a href={providerMeta.helpHref} target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.75rem', color: '#a855f7', marginRight: 'auto', display: 'flex', alignItems: 'center', gap: '3px' }}>
                  <span>{providerMeta.helpText}</span>
                  <ExternalLink size={10} />
                </a>
              </label>
              <input
                type="password"
                className="form-input"
                placeholder={providerMeta.placeholder}
                value={apiKey}
                onChange={(e) => handleApiKeyChange(e.target.value)}
                style={{ direction: 'ltr', textAlign: 'left' }}
              />
            </div>

            <div className="settings-card">
              <h4 style={{ margin: '0 0 6px 0', fontSize: '0.9rem', color: 'white' }}>معلومات الخصوصية:</h4>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0, lineHeight: '1.4' }}>
                يتم حفظ مفتاح API الخاص بك محلياً في متصفحك فقط (LocalStorage)، ويتم توجيه جميع طلبات توليد المحتوى مباشرة من متصفحك إلى خوادم المزود الذي اخترته بدون أي وسيط.
              </p>
            </div>

            <button
              className="btn btn-primary"
              style={{ width: '100%', marginTop: '10px' }}
              onClick={() => {
                setShowSettings(false);
                addLog(`تم تحديث إعدادات ${providerMeta.name} API بنجاح.`, 'success');
              }}
            >
              حفظ الإعدادات وإغلاق
            </button>
          </div>
        </div>
      )}

      {/* FOOTER */}
      <footer style={{ borderTop: '1px solid var(--border-color)', padding: '24px', textAlign: 'center', fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '40px' }}>
        <p>© 2026 جمعية التحالف للإغاثة والتنمية. تم التطوير كجزء من مشروع أتمتة النشر الذكي.</p>
      </footer>
    </div>
  );
}

export default App;
