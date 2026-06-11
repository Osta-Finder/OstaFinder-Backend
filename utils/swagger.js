import swaggerJsdoc from "swagger-jsdoc";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "OstaFinder API",
      version: "1.0.0",
      description: "API documentation for OstaFinder",
    },
    servers: [
      {
        url: "http://localhost:8000",
        description: "Development server",
      },
      {
        url: "https://ostafinder-backend.onrender.com",
        description: "Production server",
      },
    ],
    components: {
      securitySchemes: {
        cookieAuth: {
          type: "apiKey",
          in: "cookie",
          name: "accessToken",
        },
      },
      schemas: {
        // ==================== Auth ====================
        RegisterInput: {
          type: "object",
          required: ["name", "email", "phoneNumber", "password", "confirmPassword"],
          properties: {
            name: { type: "string", example: "أحمد السيد" },
            email: { type: "string", format: "email", example: "ahmed@example.com" },
            phoneNumber: { type: "string", example: "01001234567" },
            password: { type: "string", format: "password", example: "P@ssw0rd" },
            confirmPassword: { type: "string", format: "password", example: "P@ssw0rd" },
            role: { type: "string", enum: ["client", "worker"], example: "client" },
          },
        },
        LoginInput: {
          type: "object",
          required: ["emailorPhone", "password"],
          properties: {
            emailorPhone: { type: "string", example: "ahmed@example.com" },
            password: { type: "string", format: "password", example: "P@ssw0rd" },
            role: { type: "string", enum: ["client", "worker"], example: "client" },
          },
        },
        AuthUserResponse: {
          type: "object",
          properties: {
            _id: { type: "string", example: "6a1d0d12a0e18535a1179a0a" },
            name: { type: "string", example: "أحمد السيد" },
            email: { type: "string", example: "ahmed@example.com" },
            role: { type: "string", example: "client" },
            phoneNumber: { type: "string", example: "01001234567" },
          },
        },
        User: {
          type: "object",
          properties: {
            _id: { type: "string", example: "6a1d0d12a0e18535a1179a0a" },
            name: { type: "string", example: "أحمد السيد" },
            email: { type: "string", example: "ahmed@example.com" },
            phoneNumber: { type: "string", example: "01001234567" },
            password: { type: "string", example: "$2b$12$..." },
            role: { type: "string", enum: ["client", "admin"], example: "client" },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
          },
        },
        // ==================== Category ====================
        Category: {
          type: "object",
          properties: {
            _id: { type: "string", example: "6a1d0d12a0e18535a1179a0b" },
            name: { type: "string", example: "سباكة" },
            icon: { type: "string", example: "Wrench" },
            isActive: { type: "boolean", example: true },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
          },
        },
        CreateCategoryInput: {
          type: "object",
          required: ["name", "icon"],
          properties: {
            name: { type: "string", example: "سباكة", minLength: 3, maxLength: 15 },
            icon: { type: "string", example: "Wrench" },
          },
        },
        UpdateCategoryInput: {
          type: "object",
          properties: {
            name: { type: "string", example: "سباكة عامة", minLength: 2, maxLength: 15 },
            icon: { type: "string", example: "Wrench" },
          },
        },
        // ==================== Worker ====================
        Worker: {
          type: "object",
          properties: {
            _id: { type: "string", example: "6a1d1a1cec88395a3e2dadae" },
            name: { type: "string", example: "أحمد السيد" },
            email: { type: "string", example: "worker@example.com" },
            phoneNumber: { type: "string", example: "01001234567" },
            role: { type: "string", example: "worker" },
            category: {
              type: "object",
              properties: {
                _id: { type: "string", example: "6a1d0d12a0e18535a1179a0b" },
                name: { type: "string", example: "سباكة" },
              },
            },
            price: { type: "number", example: 385 },
            rating: { type: "number", example: 4.5, minimum: 0, maximum: 5 },
            isOnline: { type: "boolean", example: true },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
          },
        },
        Pagination: {
          type: "object",
          properties: {
            currentPage: { type: "number", example: 1 },
            limit: { type: "number", example: 10 },
            numberOfPages: { type: "number", example: 5 },
            next: { type: "number", example: 2 },
            prev: { type: "number", example: null, nullable: true },
          },
        },
        // ==================== Upload ====================
        UploadResponse: {
          type: "object",
          properties: {
            path: { type: "string", example: "1715000000000-abc123.png" },
            url: { type: "string", example: "https://xyz.supabase.co/storage/v1/object/public/images/1715000000000-abc123.png" },
          },
        },
        ImageItem: {
          type: "object",
          properties: {
            path: { type: "string", example: "1715000000000-abc123.png" },
            url: { type: "string", example: "https://xyz.supabase.co/storage/v1/object/public/images/1715000000000-abc123.png" },
            created_at: { type: "string", example: "2026-05-01T10:00:00.000Z" },
          },
        },
        DeleteImageInput: {
          type: "object",
          required: ["path"],
          properties: {
            path: { type: "string", example: "1715000000000-abc123.png" },
            bucket: { type: "string", example: "images" },
          },
        },
        // ==================== Request (existing) ====================
        Request: {
          type: "object",
          properties: {
            _id: { type: "string", example: "6a1d0d12a0e18535a1179a0b" },
            requestNumber: { type: "number", example: 101 },
            service: { type: "string", example: "تصليح حنفية مطبخ" },
            worker: {
              type: "object",
              properties: {
                _id: { type: "string", example: "6a1d1a1cec88395a3e2dadae" },
                name: { type: "string", example: "أحمد السيد" },
                phoneNumber: { type: "string", example: "01001234567" },
              },
            },
            user: {
              type: "object",
              properties: {
                _id: { type: "string", example: "6a1d0d12a0e18535a1179a0a" },
                name: { type: "string", example: "محمد عبد الله" },
                phoneNumber: { type: "string", example: "01009876543" },
              },
            },
            date: { type: "string", format: "date", example: "2026-05-20" },
            address: { type: "string", example: "12 شارع النيل، المهندسين" },
            amount: { type: "number", example: 385 },
            status: { type: "string", example: "مكتملة" },
            rating: {
              type: "object",
              nullable: true,
              properties: {
                _id: { type: "string", example: "6a1d0d12a0e18535a1179a0d" },
                stars: { type: "number", example: 5 },
                comment: { type: "string", example: "خدمة ممتازة" },
                createdAt: { type: "string", format: "date-time", example: "2026-05-22T10:30:00.000Z" },
              },
            },
          },
        },
        RequestStats: {
          type: "object",
          properties: {
            الكل: { type: "number", example: 10 },
            معلقة: { type: "number", example: 3 },
            مقبولة: { type: "number", example: 2 },
            "قيد التنفيذ": { type: "number", example: 1 },
            مكتملة: { type: "number", example: 2 },
            مرفوضة: { type: "number", example: 1 },
            ملغية: { type: "number", example: 1 },
          },
        },
        CreateRequestInput: {
          type: "object",
          required: ["service", "worker", "date", "address", "amount"],
          properties: {
            service: { type: "string", example: "تصليح حنفية مطبخ" },
            worker: { type: "string", example: "6a1d1a1cec88395a3e2dadae" },
            date: { type: "string", format: "date", example: "2026-05-25" },
            address: { type: "string", example: "12 شارع النيل، المهندسين" },
            amount: { type: "number", example: 385 },
          },
        },
        UpdateStatusInput: {
          type: "object",
          required: ["status"],
          properties: {
            status: {
              type: "string",
              enum: ["pending", "accepted", "in_progress", "completed", "rejected", "cancelled"],
              example: "accepted",
            },
          },
        },
        ErrorResponse: {
          type: "object",
          properties: {
            success: { type: "boolean", example: false },
            message: { type: "string", example: "الطلب غير موجود" },
          },
        },
        Rating: {
          type: "object",
          properties: {
            _id: { type: "string", example: "6a1d0d12a0e18535a1179a0b" },
            request: { type: "string", example: "6a1d0d12a0e18535a1179a0b" },
            user: {
              type: "object",
              properties: {
                _id: { type: "string", example: "6a1d0d12a0e18535a1179a0a" },
                name: { type: "string", example: "أحمد السيد" },
              },
            },
            stars: { type: "number", example: 5 },
            comment: { type: "string", example: "خدمة ممتازة" },
            createdAt: { type: "string", format: "date-time" },
          },
        },
        CreateRatingInput: {
          type: "object",
          required: ["stars"],
          properties: {
            stars: { type: "number", example: 5, minimum: 1, maximum: 5 },
            comment: { type: "string", example: "خدمة ممتازة", maxLength: 500 },
          },
        },
        UpdateRatingInput: {
          type: "object",
          properties: {
            stars: { type: "number", example: 4, minimum: 1, maximum: 5 },
            comment: { type: "string", example: "تحديث التعليق", maxLength: 500 },
          },
        },
      },
    },
    paths: {
      // ==================== Auth ====================
      "/auth/register": {
        post: {
          tags: ["Auth"],
          summary: "تسجيل مستخدم جديد",
          description: "يسجل مستخدم جديد (client أو worker) ويعيد التوكنات",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/RegisterInput" },
              },
            },
          },
          responses: {
            201: {
              description: "تم إنشاء الحساب بنجاح",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      message: { type: "string", example: "user created sucessfully" },
                      user: { $ref: "#/components/schemas/User" },
                    },
                  },
                },
              },
            },
            400: { description: "خطأ في البيانات المرسلة" },
          },
        },
      },
      "/auth/login": {
        post: {
          tags: ["Auth"],
          summary: "تسجيل الدخول",
          description: "يسجل الدخول بالبريد الإلكتروني أو رقم الهاتف",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/LoginInput" },
              },
            },
          },
          responses: {
            200: {
              description: "تم تسجيل الدخول بنجاح",
              headers: {
                "Set-Cookie": {
                  schema: { type: "string", example: "accessToken=...; HttpOnly" },
                },
              },
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      message: { type: "string", example: "Logged in successfully" },
                      user: { $ref: "#/components/schemas/AuthUserResponse" },
                    },
                  },
                },
              },
            },
            401: { description: "بيانات الدخول غير صحيحة" },
          },
        },
      },
      "/auth/logout": {
        post: {
          tags: ["Auth"],
          summary: "تسجيل الخروج",
          description: "يمسح التوكنات من الكوكيز",
          responses: {
            200: {
              description: "تم تسجيل الخروج",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      message: { type: "string", example: "Logged out" },
                    },
                  },
                },
              },
            },
          },
        },
      },
      "/auth/refresh": {
        post: {
          tags: ["Auth"],
          summary: "تحديث التوكن",
          description: "يجدد access token باستخدام refresh token الموجود في الكوكيز",
          responses: {
            200: {
              description: "تم تجديد التوكن",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      message: { type: "string", example: "Token refreshed" },
                    },
                  },
                },
              },
            },
            401: { description: "التوكن غير صالح أو منتهي" },
          },
        },
      },
      "/auth/me": {
        get: {
          tags: ["Auth"],
          summary: "بيانات المستخدم الحالي",
          description: "يعيد بيانات المستخدم المسجل دخوله حالياً",
          security: [{ cookieAuth: [] }],
          responses: {
            200: {
              description: "بيانات المستخدم",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/AuthUserResponse" },
                },
              },
            },
            401: { description: "غير مصرح به" },
          },
        },
      },
      // ==================== Categories ====================
      "/categories": {
        get: {
          tags: ["Categories"],
          summary: "قائمة التصنيفات النشطة",
          description: "يعيد جميع التصنيفات النشطة مرتبة حسب الأحدث",
          responses: {
            200: {
              description: "قائمة التصنيفات",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: { type: "boolean", example: true },
                      count: { type: "number", example: 5 },
                      data: {
                        type: "array",
                        items: { $ref: "#/components/schemas/Category" },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        post: {
          tags: ["Categories"],
          summary: "إنشاء تصنيف جديد",
          description: "ينشئ تصنيف جديد",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/CreateCategoryInput" },
              },
            },
          },
          responses: {
            200: {
              description: "تم إنشاء التصنيف بنجاح",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: { type: "boolean", example: true },
                      data: { $ref: "#/components/schemas/Category" },
                    },
                  },
                },
              },
            },
            400: { description: "التصنيف موجود بالفعل أو خطأ في البيانات" },
          },
        },
      },
      "/categories/{id}": {
        get: {
          tags: ["Categories"],
          summary: "تصنيف معين",
          description: "يعيد تصنيف محدد حسب المعرف",
          parameters: [
            {
              name: "id",
              in: "path",
              required: true,
              schema: { type: "string" },
              description: "معرف التصنيف",
            },
          ],
          responses: {
            200: {
              description: "بيانات التصنيف",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: { type: "boolean", example: true },
                      data: { $ref: "#/components/schemas/Category" },
                    },
                  },
                },
              },
            },
            404: { description: "التصنيف غير موجود" },
          },
        },
        put: {
          tags: ["Categories"],
          summary: "تحديث تصنيف",
          description: "يحدث بيانات تصنيف محدد",
          parameters: [
            {
              name: "id",
              in: "path",
              required: true,
              schema: { type: "string" },
              description: "معرف التصنيف",
            },
          ],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/UpdateCategoryInput" },
              },
            },
          },
          responses: {
            200: {
              description: "تم التحديث بنجاح",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: { type: "boolean", example: true },
                      data: { $ref: "#/components/schemas/Category" },
                    },
                  },
                },
              },
            },
            404: { description: "التصنيف غير موجود" },
          },
        },
        delete: {
          tags: ["Categories"],
          summary: "إخفاء تصنيف",
          description: "يعطل تصنيف (soft delete) - يجعله غير نشط",
          parameters: [
            {
              name: "id",
              in: "path",
              required: true,
              schema: { type: "string" },
              description: "معرف التصنيف",
            },
          ],
          responses: {
            200: {
              description: "تم إخفاء التصنيف بنجاح",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: { type: "boolean", example: true },
                      message: { type: "string", example: "تم اخفاء التصنيف بنجاح" },
                    },
                  },
                },
              },
            },
            404: { description: "التصنيف غير موجود" },
          },
        },
      },
      // ==================== Workers ====================
      "/workers": {
        get: {
          tags: ["Workers"],
          summary: "قائمة الصنايعية",
          description: "يعيد قائمة الصنايعية مع فلترة وبحث وترتيب وتقسيم صفحات",
          parameters: [
            {
              name: "keyword",
              in: "query",
              description: "كلمة للبحث (باسم الصنايعي أو اسم التصنيف)",
              schema: { type: "string" },
              example: "سباك",
              required: false,
            },
            {
              name: "sort",
              in: "query",
              description: "ترتيب النتائج (مثال: -rating, price)",
              schema: { type: "string" },
              example: "-rating",
              required: false,
            },
            {
              name: "page",
              in: "query",
              description: "رقم الصفحة",
              schema: { type: "number", default: 1 },
              example: 1,
              required: false,
            },
            {
              name: "limit",
              in: "query",
              description: "عدد النتائج في الصفحة",
              schema: { type: "number", default: 10 },
              example: 10,
              required: false,
            },
            {
              name: "category",
              in: "query",
              description: "فلتر حسب معرف التصنيف",
              schema: { type: "string" },
              example: "6a1d0d12a0e18535a1179a0b",
              required: false,
            },
            {
              name: "isOnline",
              in: "query",
              description: "فلتر حسب الحالة (متصل/غير متصل)",
              schema: { type: "string", enum: ["true", "false"] },
              example: "true",
              required: false,
            },
            {
              name: "price[gte]",
              in: "query",
              description: "أقل سعر",
              schema: { type: "number" },
              example: 100,
              required: false,
            },
            {
              name: "price[lte]",
              in: "query",
              description: "أعلى سعر",
              schema: { type: "number" },
              example: 500,
              required: false,
            },
            {
              name: "rating[gte]",
              in: "query",
              description: "أقل تقييم",
              schema: { type: "number" },
              example: 3,
              required: false,
            },
          ],
          responses: {
            200: {
              description: "قائمة الصنايعية",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: { type: "boolean", example: true },
                      results: { type: "number", example: 10 },
                      pagination: { $ref: "#/components/schemas/Pagination" },
                      data: {
                        type: "array",
                        items: { $ref: "#/components/schemas/Worker" },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      "/workers/top-by-category": {
        get: {
          tags: ["Workers"],
          summary: "أفضل صنايعي في كل تصنيف",
          description: "يعيد أفضل صنايعي مصنف حسب التقييم في كل تصنيف (حد أقصى 6)",
          responses: {
            200: {
              description: "قائمة أفضل الصنايعية",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: { type: "boolean", example: true },
                      results: { type: "number", example: 6 },
                      data: {
                        type: "array",
                        items: { $ref: "#/components/schemas/Worker" },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      // ==================== Upload ====================
      "/upload": {
        get: {
          tags: ["Upload"],
          summary: "قائمة الملفات المرفوعة",
          description: "يعيد جميع الصور من Supabase bucket",
          security: [{ cookieAuth: [] }],
          parameters: [
            {
              name: "bucket",
              in: "query",
              description: "اسم الـ bucket (اختياري، الافتراضي images)",
              schema: { type: "string" },
              example: "images",
              required: false,
            },
          ],
          responses: {
            200: {
              description: "قائمة الصور",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: { type: "boolean", example: true },
                      data: {
                        type: "array",
                        items: { $ref: "#/components/schemas/ImageItem" },
                      },
                    },
                  },
                },
              },
            },
            401: { description: "غير مصرح به" },
          },
        },
        post: {
          tags: ["Upload"],
          summary: "رفع ملف",
          description: "يرفع صورة إلى Supabase bucket",
          security: [{ cookieAuth: [] }],
          requestBody: {
            required: true,
            content: {
              "multipart/form-data": {
                schema: {
                  type: "object",
                  properties: {
                    file: {
                      type: "string",
                      format: "binary",
                      description: "الملف المراد رفعه",
                    },
                    bucket: {
                      type: "string",
                      description: "اسم الـ bucket (اختياري)",
                      example: "images",
                    },
                  },
                },
              },
            },
          },
          responses: {
            200: {
              description: "تم رفع الملف بنجاح",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: { type: "boolean", example: true },
                      data: { $ref: "#/components/schemas/UploadResponse" },
                    },
                  },
                },
              },
            },
            400: { description: "لم يتم اختيار ملف" },
            401: { description: "غير مصرح به" },
          },
        },
        delete: {
          tags: ["Upload"],
          summary: "حذف ملف",
          description: "يحذف ملف من Supabase bucket",
          security: [{ cookieAuth: [] }],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/DeleteImageInput" },
              },
            },
          },
          responses: {
            200: {
              description: "تم حذف الملف بنجاح",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: { type: "boolean", example: true },
                      message: { type: "string", example: "تم حذف الملف بنجاح" },
                    },
                  },
                },
              },
            },
            400: { description: "لم يتم إرسال مسار الملف" },
            401: { description: "غير مصرح به" },
          },
        },
      },
      // ==================== Requests (existing) ====================
      "/requests/stats": {
        get: {
          tags: ["Requests"],
          summary: "إحصائيات الطلبات",
          description: "حسب صلاحية المستخدم:\n- **client**: إحصائيات طلباته فقط\n- **admin**: إحصائيات كل الطلبات\n- **worker**: ممنوع (403)\n- يمكن تمرير `?user=id` يدوياً لإحصائيات مستخدم معين",
          security: [{ cookieAuth: [] }],
          parameters: [
            {
              name: "user",
              in: "query",
              description: "اختياري - ID المستخدم (للتجربة)، يتجاوز صلاحية التوكن",
              schema: { type: "string" },
              example: "6a1d0d12a0e18535a1179a0a",
              required: false,
            },
          ],
          responses: {
            200: {
              description: "إحصائيات الطلبات",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: { type: "boolean", example: true },
                      data: { $ref: "#/components/schemas/RequestStats" },
                    },
                  },
                },
              },
            },
            403: { description: "الصنايعي لا يمكنه عرض الإحصائيات" },
          },
        },
      },
      "/requests/my-worker": {
        get: {
          tags: ["Requests"],
          summary: "طلبات الصنايعي",
          description: "يعيد طلبات الصنايعي المسجل دخوله فقط حسب التوكن",
          security: [{ cookieAuth: [] }],
          responses: {
            200: {
              description: "قائمة طلبات الصنايعي",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: { type: "boolean", example: true },
                      count: { type: "number" },
                      data: {
                        type: "array",
                        items: { $ref: "#/components/schemas/Request" },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      "/requests": {
        get: {
          tags: ["Requests"],
          summary: "قائمة الطلبات",
          description: "يعيد جميع الطلبات مع فلتر اختياري حسب الحالة",
          security: [{ cookieAuth: [] }],
          parameters: [
            {
              name: "status",
              in: "query",
              description: "فلتر حسب الحالة (معلقة، مقبولة، قيد التنفيذ، مكتملة، مرفوضة، ملغية)",
              schema: { type: "string" },
              example: "معلقة",
              required: false,
            },
            {
              name: "user",
              in: "query",
              description: "فلتر حسب المستخدم (معرف الـ ID)",
              schema: { type: "string" },
              example: "6a1d0d12a0e18535a1179a0a",
              required: false,
            },
          ],
          responses: {
            200: {
              description: "قائمة الطلبات",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: { type: "boolean", example: true },
                      count: { type: "number" },
                      data: {
                        type: "array",
                        items: { $ref: "#/components/schemas/Request" },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        post: {
          tags: ["Requests"],
          summary: "إنشاء طلب جديد",
          description: "إنشاء طلب خدمة جديد",
          security: [{ cookieAuth: [] }],
          parameters: [
            {
              name: "user",
              in: "query",
              description: "اختياري - ID المستخدم (للتجربة في Swagger)، لو مفيهوش هياخد من التوكن",
              schema: { type: "string" },
              example: "6a1d0d12a0e18535a1179a0a",
              required: false,
            },
          ],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/CreateRequestInput" },
              },
            },
          },
          responses: {
            201: {
              description: "تم إنشاء الطلب بنجاح",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: { type: "boolean", example: true },
                      data: { $ref: "#/components/schemas/Request" },
                    },
                  },
                },
              },
            },
            400: { description: "خطأ في البيانات المرسلة" },
          },
        },
      },
      "/requests/{id}": {
        get: {
          tags: ["Requests"],
          summary: "طلب معين",
          description: "يعيد طلب محدد حسب الـ ID",
          security: [{ cookieAuth: [] }],
          parameters: [
            {
              name: "id",
              in: "path",
              required: true,
              schema: { type: "string" },
              description: "معرف الطلب",
            },
          ],
          responses: {
            200: {
              description: "بيانات الطلب",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: { type: "boolean", example: true },
                      data: { $ref: "#/components/schemas/Request" },
                    },
                  },
                },
              },
            },
            404: { description: "الطلب غير موجود" },
          },
        },
      },
      "/requests/{id}/status": {
        patch: {
          tags: ["Requests"],
          summary: "تحديث حالة الطلب",
          description: "تحديث حالة طلب معين",
          security: [{ cookieAuth: [] }],
          parameters: [
            {
              name: "id",
              in: "path",
              required: true,
              schema: { type: "string" },
              description: "معرف الطلب",
            },
          ],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/UpdateStatusInput" },
              },
            },
          },
          responses: {
            200: {
              description: "تم تحديث الحالة بنجاح",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: { type: "boolean", example: true },
                      data: {
                        type: "object",
                        properties: {
                          _id: { type: "string" },
                          requestNumber: { type: "number" },
                          status: { type: "string" },
                        },
                      },
                    },
                  },
                },
              },
            },
            404: { description: "الطلب غير موجود" },
          },
        },
      },
      "/requests/{id}/cancel": {
        patch: {
          tags: ["Requests"],
          summary: "إلغاء طلب",
          description: "إلغاء طلب معلق فقط",
          security: [{ cookieAuth: [] }],
          parameters: [
            {
              name: "id",
              in: "path",
              required: true,
              schema: { type: "string" },
              description: "معرف الطلب",
            },
          ],
          responses: {
            200: {
              description: "تم إلغاء الطلب بنجاح",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: { type: "boolean", example: true },
                      data: {
                        type: "object",
                        properties: {
                          _id: { type: "string" },
                          requestNumber: { type: "number" },
                          status: { type: "string", example: "ملغية" },
                        },
                      },
                    },
                  },
                },
              },
            },
            400: { description: "لا يمكن إلغاء طلب غير معلق" },
            404: { description: "الطلب غير موجود" },
          },
        },
      },
      "/requests/{id}/rating": {
        post: {
          tags: ["Ratings"],
          summary: "إنشاء تقييم لطلب",
          description: "تقييم طلب مكتمل (مرة واحدة فقط)",
          security: [{ cookieAuth: [] }],
          parameters: [
            {
              name: "id",
              in: "path",
              required: true,
              schema: { type: "string" },
              description: "معرف الطلب",
            },
          ],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/CreateRatingInput" },
              },
            },
          },
          responses: {
            201: {
              description: "تم إنشاء التقييم",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: { type: "boolean", example: true },
                      data: { $ref: "#/components/schemas/Rating" },
                    },
                  },
                },
              },
            },
            400: { description: "الطلب غير مكتمل أو تم تقييمه من قبل" },
            404: { description: "الطلب غير موجود" },
          },
        },
        get: {
          tags: ["Ratings"],
          summary: "عرض تقييم الطلب",
          security: [{ cookieAuth: [] }],
          parameters: [
            {
              name: "id",
              in: "path",
              required: true,
              schema: { type: "string" },
              description: "معرف الطلب",
            },
          ],
          responses: {
            200: {
              description: "بيانات التقييم",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: { type: "boolean", example: true },
                      data: { $ref: "#/components/schemas/Rating" },
                    },
                  },
                },
              },
            },
            404: { description: "لا يوجد تقييم لهذا الطلب" },
          },
        },
        patch: {
          tags: ["Ratings"],
          summary: "تعديل التقييم",
          security: [{ cookieAuth: [] }],
          parameters: [
            {
              name: "id",
              in: "path",
              required: true,
              schema: { type: "string" },
              description: "معرف الطلب",
            },
          ],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/UpdateRatingInput" },
              },
            },
          },
          responses: {
            200: {
              description: "تم التعديل",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: { type: "boolean", example: true },
                      data: { $ref: "#/components/schemas/Rating" },
                    },
                  },
                },
              },
            },
            404: { description: "لا يوجد تقييم لهذا الطلب" },
          },
        },
        delete: {
          tags: ["Ratings"],
          summary: "حذف التقييم",
          security: [{ cookieAuth: [] }],
          parameters: [
            {
              name: "id",
              in: "path",
              required: true,
              schema: { type: "string" },
              description: "معرف الطلب",
            },
          ],
          responses: {
            200: {
              description: "تم الحذف",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: { type: "boolean", example: true },
                      message: { type: "string", example: "تم حذف التقييم بنجاح" },
                    },
                  },
                },
              },
            },
            404: { description: "لا يوجد تقييم لهذا الطلب" },
          },
        },
      },
    },
  },
  apis: [],
};

export const swaggerSpec = swaggerJsdoc(options);
