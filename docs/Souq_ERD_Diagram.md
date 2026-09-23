# مخطط قاعدة البيانات (ERD) لمشروع Souq+ (النسخة الدقيقة والكاملة)

هذا المخطط الهندسي يمثل هيكلة الجداول والعلاقات **مع كافة الحقول الدقيقة** (بما فيها حالات التأجير والبيع، حالة الإعلان، الحقول الإضافية، والتواريخ) ليطابق ملف `schema.prisma` بنسبة 100% كما يطلب مشرفو مشروع التخرج.

```mermaid
erDiagram
    %% الجداول الرئيسية
    User {
        String id PK
        String email
        String passwordHash
        String fullName
        String phoneNumber
        Role role "BUYER/SELLER/ADMIN"
        Boolean isVerified
        DateTime createdAt
        DateTime updatedAt
    }
    
    Listing {
        String id PK
        String title
        String description
        ListingCategory category "REAL_ESTATE/CAR"
        ListingType listingType "SALE/RENT"
        ListingStatus status "ACTIVE/SOLD..."
        Float price
        RentPeriod rentPeriod "DAILY/MONTHLY..."
        String city
        String district
        Float latitude
        Float longitude
        String_Array images
        Json aiMetadata
        DateTime createdAt
        DateTime updatedAt
        String sellerId FK
    }

    %% جداول التفاصيل (Polymorphism)
    PropertyDetails {
        String id PK
        String propertyType
        Float area
        Int bedrooms
        Int bathrooms
        Int floor
        Int yearBuilt
        String_Array amenities
        String listingId FK
    }
    
    CarDetails {
        String id PK
        String brand
        String model
        Int year
        Float mileage
        String fuelType
        String transmission
        String condition
        String listingId FK
    }

    %% جداول التفاعل
    Offer {
        String id PK
        Float amount
        OfferStatus status
        DateTime expiresAt
        DateTime createdAt
        DateTime updatedAt
        String buyerId FK
        String listingId FK
    }
    
    Message {
        String id PK
        String content
        Boolean isRead
        DateTime createdAt
        DateTime updatedAt
        String senderId FK
        String receiverId FK
        String listingId FK
    }
    
    Favorite {
        String id PK
        DateTime createdAt
        String userId FK
        String listingId FK
    }
    
    Notification {
        String id PK
        NotificationType type
        String content
        Boolean isRead
        DateTime createdAt
        String userId FK
    }

    %% العلاقات (Relationships)
    User ||--o{ Listing : "ينشر (Seller)"
    User ||--o{ Message : "يرسل/يستقبل"
    User ||--o{ Favorite : "يضيف للمفضلة"
    User ||--o{ Offer : "يقدم عرض سعر"
    User ||--o{ Notification : "يستقبل إشعار"
    
    Listing ||--o| PropertyDetails : "يمتلك تفاصيل عقار (1-to-1)"
    Listing ||--o| CarDetails : "يمتلك تفاصيل سيارة (1-to-1)"
    Listing ||--o{ Offer : "يتلقى عروض"
    Listing ||--o{ Favorite : "يُحفظ بواسطة (unique user,listing)"
    Listing ||--o{ Message : "استفسارات الإعلان"
```

### كيف تقرأ هذا المخطط المتقدم؟
1. **الشمولية:** تمت إضافة جميع الحقول المفقودة مسبقاً (مثل `listingType` الذي يحدد إن كان الإعلان للبيع أو الإيجار، و `rentPeriod`).
2. **البيانات الوصفية:** تم إضافة الحقول التقنية الضرورية مثل `isRead` للرسائل والإشعارات، و `expiresAt` لمدة صلاحية العرض، وتواريخ الإنشاء والتعديل `createdAt, updatedAt`.
3. **الدقة:** يظهر في جدول `Favorite` القيد (Unique Constraint) بوضوح لضمان عدم تكرار الإعجاب بنفس الإعلان من نفس المستخدم.
