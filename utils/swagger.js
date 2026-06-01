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
        Request: {
          type: "object",
          properties: {
            _id: { type: "string", example: "60d...af1" },
            requestNumber: { type: "number", example: 101 },
            service: { type: "string", example: "تصليح حنفية مطبخ" },
            worker: {
              type: "object",
              properties: {
                _id: { type: "string" },
                name: { type: "string", example: "أحمد السيد" },
                phoneNumber: { type: "string", example: "01001234567" },
              },
            },
            user: {
              type: "object",
              properties: {
                _id: { type: "string" },
                name: { type: "string" },
                phoneNumber: { type: "string" },
              },
            },
            date: { type: "string", format: "date", example: "2026-05-20" },
            amount: { type: "number", example: 385 },
            status: {
              type: "string",
              enum: ["معلقة", "مقبولة", "قيد التنفيذ", "مكتملة", "مرفوضة", "ملغية"],
              example: "معلقة",
            },
          },
        },
        RequestStats: {
          type: "object",
          properties: {
            الكل: { type: "number", example: 7 },
            معلقة: { type: "number", example: 2 },
            مقبولة: { type: "number", example: 1 },
            "قيد التنفيذ": { type: "number", example: 1 },
            مكتملة: { type: "number", example: 2 },
            مرفوضة: { type: "number", example: 1 },
            ملغية: { type: "number", example: 0 },
          },
        },
        CreateRequestInput: {
          type: "object",
          required: ["service", "worker", "date", "amount"],
          properties: {
            service: { type: "string", example: "تصليح حنفية مطبخ" },
            worker: { type: "string", example: "60d...workerId" },
            date: { type: "string", format: "date", example: "2026-05-20" },
            amount: { type: "number", example: 385 },
          },
        },
        UpdateStatusInput: {
          type: "object",
          required: ["status"],
          properties: {
            status: {
              type: "string",
              enum: ["pending", "accepted", "inProgress", "completed", "rejected", "cancelled"],
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
      },
    },
    paths: {
      "/requests/stats": {
        get: {
          tags: ["Requests"],
          summary: "إحصائيات الطلبات",
          description: "يعيد عدد الطلبات حسب كل حالة",
          security: [{ cookieAuth: [] }],
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
              example: "60d...userId",
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
            400: {
              description: "خطأ في البيانات المرسلة",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorResponse" },
                },
              },
            },
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
            404: {
              description: "الطلب غير موجود",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorResponse" },
                },
              },
            },
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
            404: {
              description: "الطلب غير موجود",
            },
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
            400: {
              description: "لا يمكن إلغاء طلب غير معلق",
            },
            404: {
              description: "الطلب غير موجود",
            },
          },
        },
      },
    },
  },
  apis: [],
};

export const swaggerSpec = swaggerJsdoc(options);
