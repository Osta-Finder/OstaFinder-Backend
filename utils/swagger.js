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
        // ==================== Worker Service ====================
        WorkerService: {
          type: "object",
          properties: {
            _id: { type: "string", example: "6a1d0d12a0e18535a1179a0c" },
            worker: { type: "string", example: "6a1d1a1cec88395a3e2dadae" },
            title: { type: "string", example: "تصليح حنفية" },
            category: { type: "string", example: "سباكة" },
            price: { type: "number", example: 385 },
            description: { type: "string", example: "تصليح جميع أنواع الحنفيات" },
            location: { type: "string", example: "المهندسين" },
            image: { type: "string", nullable: true },
            status: { type: "string", enum: ["active", "paused", "draft"] },
          },
        },
        CreateServiceInput: {
          type: "object",
          required: ["title", "category", "price", "description", "location"],
          properties: {
            title: { type: "string", example: "تصليح حنفية" },
            category: { type: "string", example: "سباكة" },
            price: { type: "number", example: 385 },
            description: { type: "string", example: "تصليح جميع أنواع الحنفيات" },
            location: { type: "string", example: "المهندسين" },
          },
        },
        // ==================== Worker Work (Portfolio) ====================
        WorkerWork: {
          type: "object",
          properties: {
            _id: { type: "string", example: "6a1d0d12a0e18535a1179a0e" },
            worker: { type: "string", example: "6a1d1a1cec88395a3e2dadae" },
            title: { type: "string", example: "تركيب مطبخ كامل" },
            category: { type: "string", example: "نجارة" },
            clientName: { type: "string", example: "محمد عبد الله" },
            description: { type: "string" },
            date: { type: "string", format: "date" },
            source: { type: "string", enum: ["platform", "outside"] },
            status: { type: "string", enum: ["completed", "in_progress"] },
            location: { type: "string" },
            price: { type: "number", example: 1500 },
            images: { type: "array", items: { type: "string" } },
          },
        },
        CreateWorkInput: {
          type: "object",
          required: ["title", "category", "clientName", "description", "date", "location", "price"],
          properties: {
            title: { type: "string", example: "تركيب مطبخ كامل" },
            category: { type: "string", example: "نجارة" },
            clientName: { type: "string", example: "محمد عبد الله" },
            description: { type: "string", example: "تم تركيب المطبخ بالكامل" },
            date: { type: "string", format: "date" },
            location: { type: "string", example: "6 أكتوبر" },
            price: { type: "number", example: 1500 },
          },
        },
        // ==================== Worker Dashboard ====================
        WorkerStats: {
          type: "object",
          properties: {
            totalOrders: {
              type: "object",
              properties: {
                value: { type: "number", example: 15 },
                change: { type: "string", example: "+0%" },
                period: { type: "string", example: "هذا الشهر" },
              },
            },
            employmentRate: {
              type: "object",
              properties: {
                value: { type: "string", example: "73%" },
                change: { type: "string", example: "+0%" },
                period: { type: "string", example: "هذا الشهر" },
              },
            },
            totalEarnings: {
              type: "object",
              properties: {
                value: { type: "number", example: 12500 },
                currency: { type: "string", example: "ج.م" },
                change: { type: "string", example: "+0%" },
                period: { type: "string", example: "هذا الشهر" },
              },
            },
          },
        },
        // ==================== Order ====================
        CreateOrderInput: {
          type: "object",
          required: ["category", "description", "phone", "preferredTime", "location"],
          properties: {
            category: { type: "string", example: "6a1d0d12a0e18535a1179a0b" },
            description: { type: "string", example: "عاوز سباك يصلح حنفية المطبخ" },
            phone: { type: "string", example: "01001234567" },
            preferredTime: { type: "string", example: "2026-05-25T14:00:00Z" },
            location: { type: "string", example: "12 شارع النيل، المهندسين" },
          },
        },
        // ==================== Worker Onboarding ====================
        WorkerOnboardingInput: {
          type: "object",
          required: ["firstName", "lastName", "email", "phone"],
          properties: {
            firstName: { type: "string", example: "أحمد" },
            lastName: { type: "string", example: "السيد" },
            email: { type: "string", example: "worker@example.com" },
            phone: { type: "string", example: "01001234567" },
            city: { type: "string", example: "القاهرة" },
            address: { type: "string", example: "المهندسين" },
            specialization: { type: "string", example: "6a1d0d12a0e18535a1179a0b" },
            yearsOfExperience: { type: "number", example: 5 },
            bio: { type: "string", example: "صنايعي خبرة 5 سنين" },
            nationalId: { type: "string", example: "28401011234567" },
          },
        },
        WorkerApprovalInput: {
          type: "object",
          required: ["status"],
          properties: {
            status: { type: "string", enum: ["approved", "rejected"], example: "approved" },
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
            image: { type: "string", nullable: true, example: "https://supabase.co/storage/.../image.png" },
            status: { type: "string", example: "مكتملة" },
            eta: { type: "string", example: "" },
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
            image: { type: "string", nullable: true, example: "https://supabase.co/storage/.../image.png", description: "رابط الصورة بعد رفعها عبر /upload" },
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
        put: {
          tags: ["Auth"],
          summary: "تحديث بيانات المستخدم",
          description: "يحدث اسم المستخدم ورقم الهاتف",
          security: [{ cookieAuth: [] }],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    name: { type: "string", example: "أحمد السيد" },
                    phoneNumber: { type: "string", example: "01009876543" },
                  },
                },
              },
            },
          },
          responses: {
            200: {
              description: "تم التحديث",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: { type: "boolean", example: true },
                      data: { $ref: "#/components/schemas/AuthUserResponse" },
                    },
                  },
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
      // ==================== Workers Profile & Onboarding ====================
      "/workers/profile": {
        get: {
          tags: ["Workers"],
          summary: "الملف الشخصي للصنايعي",
          description: "يعيد بيانات الصنايعي المسجل دخوله",
          security: [{ cookieAuth: [] }],
          responses: {
            200: {
              description: "بيانات الصنايعي",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: { type: "boolean", example: true },
                      data: { $ref: "#/components/schemas/Worker" },
                    },
                  },
                },
              },
            },
            401: { description: "غير مصرح به" },
            404: { description: "الصنايعي غير موجود" },
          },
        },
      },
      "/workers/onboarding": {
        post: {
          tags: ["Workers"],
          summary: "تكملة بيانات الصنايعي",
          description: "يكمل الصنايعي بياناته (specialization, address, bio, ...)",
          security: [{ cookieAuth: [] }],
          requestBody: {
            required: true,
            content: {
              "multipart/form-data": {
                schema: { $ref: "#/components/schemas/WorkerOnboardingInput" },
              },
            },
          },
          responses: {
            200: {
              description: "تم تكملة البيانات بنجاح",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: { type: "boolean", example: true },
                      message: { type: "string" },
                      data: { $ref: "#/components/schemas/Worker" },
                    },
                  },
                },
              },
            },
            400: { description: "بيانات ناقصة" },
            401: { description: "غير مصرح به" },
          },
        },
      },
      "/workers/pending-approval": {
        get: {
          tags: ["Workers"],
          summary: "الصنايعية في انتظار الموافقة",
          description: "يعيد قائمة الصنايعية اللي في انتظار الموافقة (لـ admin)",
          responses: {
            200: {
              description: "قائمة الصنايعية",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: { type: "boolean", example: true },
                      results: { type: "number" },
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
      "/workers/{workerId}/approval": {
        patch: {
          tags: ["Workers"],
          summary: "الموافقة على صنايعي",
          description: "يوافق أو يرفض صنايعي (لـ admin فقط)",
          parameters: [
            {
              name: "workerId",
              in: "path",
              required: true,
              schema: { type: "string" },
              description: "معرف الصنايعي",
            },
          ],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/WorkerApprovalInput" },
              },
            },
          },
          responses: {
            200: {
              description: "تم التحديث",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: { type: "boolean", example: true },
                      message: { type: "string" },
                      data: { $ref: "#/components/schemas/Worker" },
                    },
                  },
                },
              },
            },
            400: { description: "حالة غير صالحة" },
            404: { description: "الصنايعي غير موجود" },
          },
        },
      },

      // ==================== Worker Services ====================
      "/workers/services": {
        get: {
          tags: ["Workers Services"],
          summary: "خدمات الصنايعي",
          description: "يعيد قائمة خدمات الصنايعي المسجل",
          security: [{ cookieAuth: [] }],
          responses: {
            200: {
              description: "قائمة الخدمات",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: { type: "boolean", example: true },
                      data: {
                        type: "array",
                        items: { $ref: "#/components/schemas/WorkerService" },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        post: {
          tags: ["Workers Services"],
          summary: "إضافة خدمة جديدة",
          description: "يضيف الصنايعي خدمة جديدة",
          security: [{ cookieAuth: [] }],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/CreateServiceInput" },
              },
            },
          },
          responses: {
            201: {
              description: "تمت الإضافة",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: { type: "boolean", example: true },
                      data: { $ref: "#/components/schemas/WorkerService" },
                    },
                  },
                },
              },
            },
          },
        },
      },
      "/workers/services/{id}": {
        get: {
          tags: ["Workers Services"],
          summary: "خدمة معينة",
          description: "يعيد خدمة محددة",
          security: [{ cookieAuth: [] }],
          parameters: [
            {
              name: "id",
              in: "path",
              required: true,
              schema: { type: "string" },
              description: "معرف الخدمة",
            },
          ],
          responses: {
            200: {
              description: "بيانات الخدمة",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: { type: "boolean", example: true },
                      data: { $ref: "#/components/schemas/WorkerService" },
                    },
                  },
                },
              },
            },
            404: { description: "الخدمة غير موجودة" },
          },
        },
        put: {
          tags: ["Workers Services"],
          summary: "تحديث خدمة",
          description: "يحدث بيانات خدمة محددة",
          security: [{ cookieAuth: [] }],
          parameters: [
            {
              name: "id",
              in: "path",
              required: true,
              schema: { type: "string" },
              description: "معرف الخدمة",
            },
          ],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/CreateServiceInput" },
              },
            },
          },
          responses: {
            200: {
              description: "تم التحديث",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: { type: "boolean", example: true },
                      data: { $ref: "#/components/schemas/WorkerService" },
                    },
                  },
                },
              },
            },
            404: { description: "الخدمة غير موجودة" },
          },
        },
        delete: {
          tags: ["Workers Services"],
          summary: "حذف خدمة",
          description: "يحذف خدمة محددة",
          security: [{ cookieAuth: [] }],
          parameters: [
            {
              name: "id",
              in: "path",
              required: true,
              schema: { type: "string" },
              description: "معرف الخدمة",
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
                      data: { type: "object" },
                    },
                  },
                },
              },
            },
            404: { description: "الخدمة غير موجودة" },
          },
        },
      },
      // ==================== Worker Portfolio ====================
      "/workers/works": {
        get: {
          tags: ["Workers Portfolio"],
          summary: "أعمال الصنايعي (Portfolio)",
          description: "يعيد قائمة أعمال الصنايعي المسجل",
          security: [{ cookieAuth: [] }],
          responses: {
            200: {
              description: "قائمة الأعمال",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: { type: "boolean", example: true },
                      data: {
                        type: "array",
                        items: { $ref: "#/components/schemas/WorkerWork" },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        post: {
          tags: ["Workers Portfolio"],
          summary: "إضافة عمل جديد",
          description: "يضيف الصنايعي عمل جديد إلى Portfolio",
          security: [{ cookieAuth: [] }],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/CreateWorkInput" },
              },
            },
          },
          responses: {
            201: {
              description: "تمت الإضافة",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: { type: "boolean", example: true },
                      data: { $ref: "#/components/schemas/WorkerWork" },
                    },
                  },
                },
              },
            },
          },
        },
      },
      "/workers/works/{id}": {
        get: {
          tags: ["Workers Portfolio"],
          summary: "عمل معين",
          description: "يعيد عمل محدد من Portfolio",
          security: [{ cookieAuth: [] }],
          parameters: [
            {
              name: "id",
              in: "path",
              required: true,
              schema: { type: "string" },
              description: "معرف العمل",
            },
          ],
          responses: {
            200: {
              description: "بيانات العمل",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: { type: "boolean", example: true },
                      data: { $ref: "#/components/schemas/WorkerWork" },
                    },
                  },
                },
              },
            },
            404: { description: "العمل غير موجود" },
          },
        },
        put: {
          tags: ["Workers Portfolio"],
          summary: "تحديث عمل",
          description: "يحدث بيانات عمل (فقط الـ outside source)",
          security: [{ cookieAuth: [] }],
          parameters: [
            {
              name: "id",
              in: "path",
              required: true,
              schema: { type: "string" },
              description: "معرف العمل",
            },
          ],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/CreateWorkInput" },
              },
            },
          },
          responses: {
            200: {
              description: "تم التحديث",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: { type: "boolean", example: true },
                      data: { $ref: "#/components/schemas/WorkerWork" },
                    },
                  },
                },
              },
            },
            403: { description: "لا يمكن تعديل الأعمال المنفذة عبر المنصة" },
            404: { description: "العمل غير موجود" },
          },
        },
        delete: {
          tags: ["Workers Portfolio"],
          summary: "حذف عمل",
          description: "يحذف عمل (فقط الـ outside source)",
          security: [{ cookieAuth: [] }],
          parameters: [
            {
              name: "id",
              in: "path",
              required: true,
              schema: { type: "string" },
              description: "معرف العمل",
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
                      data: { type: "object" },
                    },
                  },
                },
              },
            },
            403: { description: "لا يمكن حذف الأعمال المنفذة عبر المنصة" },
            404: { description: "العمل غير موجود" },
          },
        },
      },
      // ==================== Orders ====================
      "/orders/{workerId}": {
        post: {
          tags: ["Orders"],
          summary: "إنشاء طلب خدمة (بدون تسجيل)",
          description: "ينشئ طلب خدمة لصنايعي معين (بدون الحاجة لتسجيل دخول)",
          parameters: [
            {
              name: "workerId",
              in: "path",
              required: true,
              schema: { type: "string" },
              description: "معرف الصنايعي",
            },
          ],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/CreateOrderInput" },
              },
            },
          },
          responses: {
            201: {
              description: "تم إرسال الطلب",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: { type: "boolean", example: true },
                      message: { type: "string" },
                      data: { type: "object" },
                    },
                  },
                },
              },
            },
            400: { description: "خطأ: التخصص لا يطابق" },
            404: { description: "الصنايعي غير موجود" },
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
          description: "حسب صلاحية المستخدم:\n- **client**: إحصائيات طلباته (`{ user: req.user.id }`)\n- **worker**: إحصائيات الطلبات المطلوبة منه (`{ worker: req.user.id }`)\n- **admin**: إحصائيات كل الطلبات (يمكن تمرير `?user=` أو `?worker=` للفلترة)",
          security: [{ cookieAuth: [] }],
          parameters: [
            {
              name: "user",
              in: "query",
              description: "فلتر حسب المستخدم (لـ admin فقط)",
              schema: { type: "string" },
              example: "6a1d0d12a0e18535a1179a0a",
              required: false,
            },
            {
              name: "worker",
              in: "query",
              description: "فلتر حسب الصنايعي (لـ admin فقط)",
              schema: { type: "string" },
              example: "6a1d1a1cec88395a3e2dadae",
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
            403: { description: "غير مصرح لك" },
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
          description: "يعيد الطلبات. الـ **client** يشوف طلباته، الـ **admin** يشوف الكل.\nالـ **worker** يستخدم `GET /requests/my-worker` المخصص له.",
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
          description: "إنشاء طلب خدمة جديد. الـ `user` ياخد من التوكن تلقائياً.",
          security: [{ cookieAuth: [] }],
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
          description: "يعيد طلب محدد حسب الـ ID (صاحب الطلب، الصنايعي المسؤول، أو admin فقط)",
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
            403: { description: "لا يمكنك الاطلاع على هذا الطلب" },
            404: { description: "الطلب غير موجود" },
          },
        },
      },
      "/requests/{id}/status": {
        patch: {
          tags: ["Requests"],
          summary: "تحديث حالة الطلب",
          description: "تحديث حالة طلب معين (الصنايعي المسؤول أو admin فقط). إذا كانت `completed`، بينشئ إدخال Portfolio تلقائياً.",
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
            403: { description: "لا يمكنك تعديل حالة هذا الطلب" },
            404: { description: "الطلب غير موجود" },
          },
        },
      },
      "/requests/{id}/cancel": {
        patch: {
          tags: ["Requests"],
          summary: "إلغاء طلب",
          description: "إلغاء طلب معلق (صاحب الطلب أو admin فقط)",
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
            403: { description: "لا يمكنك إلغاء هذا الطلب" },
            404: { description: "الطلب غير موجود" },
          },
        },
      },
      "/requests/{id}/rating": {
        post: {
          tags: ["Ratings"],
          summary: "إنشاء تقييم لطلب",
          description: "تقييم طلب مكتمل (مرة واحدة فقط، صاحب الطلب فقط)",
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
            403: { description: "فقط صاحب الطلب يمكنه التقييم" },
            404: { description: "الطلب غير موجود" },
          },
        },
        get: {
          tags: ["Ratings"],
          summary: "عرض تقييم الطلب",
          description: "يعيد تقييم طلب معين",
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
          description: "تعديل تقييمك أنت فقط",
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
            403: { description: "لا يمكنك تعديل تقييم غيرك" },
            404: { description: "لا يوجد تقييم لهذا الطلب" },
          },
        },
        delete: {
          tags: ["Ratings"],
          summary: "حذف التقييم",
          description: "حذف تقييمك أنت أو admin",
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
            403: { description: "لا يمكنك حذف تقييم غيرك" },
            404: { description: "لا يوجد تقييم لهذا الطلب" },
          },
        },
      },
    },
  },
  apis: [],
};

export const swaggerSpec = swaggerJsdoc(options);
