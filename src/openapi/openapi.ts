export function buildOpenAPIDocument() {
  return {
    openapi: '3.0.3',
    info: { 
      title: 'Wedly API', 
      version: '1.0.0', 
      description: 'Wedding planning platform API - OpenAPI generated from Zod schemas' 
    },
    servers: [{ url: process.env.API_BASE_URL || 'http://localhost:4000' }],
    components: {
      securitySchemes: { 
        bearerAuth: { 
          type: 'http', 
          scheme: 'bearer', 
          bearerFormat: 'JWT' 
        } 
      },
      schemas: {
        Register: {
          type: 'object',
          properties: {
            email: { type: 'string', format: 'email' },
            password: { type: 'string', minLength: 8 },
            name: { type: 'string' }
          },
          required: ['email', 'password']
        },
        Login: {
          type: 'object',
          properties: {
            email: { type: 'string', format: 'email' },
            password: { type: 'string', minLength: 8 }
          },
          required: ['email', 'password']
        },
        GoogleOneTap: {
          type: 'object',
          properties: {
            credential: { type: 'string' }
          },
          required: ['credential']
        },
        CreateEvent: {
          type: 'object',
          properties: {
            title: { type: 'string' },
            date: { type: 'string', format: 'date-time' },
            locale: { type: 'string', enum: ['sr', 'en'], default: 'sr' },
            sectionsI18n: { type: 'object' }
          },
          required: ['title']
        },
        BudgetItem: {
          type: 'object',
          properties: {
            category: { type: 'string' },
            title: { type: 'string' },
            planned: { type: 'integer', default: 0 },
            paid: { type: 'integer', default: 0 },
            status: { type: 'string', enum: ['TODO', 'IN_PROGRESS', 'DONE'], default: 'TODO' }
          },
          required: ['category', 'title']
        },
        ChecklistItem: {
          type: 'object',
          properties: {
            title: { type: 'string' },
            description: { type: 'string' },
            status: { type: 'string', enum: ['TODO', 'IN_PROGRESS', 'DONE'], default: 'TODO' },
            dueDate: { type: 'string', format: 'date-time' }
          },
          required: ['title']
        },
        Guest: {
          type: 'object',
          properties: {
            firstName: { type: 'string' },
            lastName: { type: 'string' },
            email: { type: 'string', format: 'email' },
            phone: { type: 'string' },
            side: { type: 'string', enum: ['BRIDE', 'GROOM', 'BOTH', 'OTHER'], default: 'OTHER' },
            status: { type: 'string', enum: ['PENDING', 'COMING', 'NOT_COMING'], default: 'PENDING' }
          },
          required: ['firstName', 'lastName']
        },
        Table: {
          type: 'object',
          properties: {
            name: { type: 'string' },
            capacity: { type: 'integer', default: 8 }
          },
          required: ['name']
        },
        MicrositeUpsert: {
          type: 'object',
          properties: {
            slug: { type: 'string', pattern: '^[a-z0-9-]+$', minLength: 3 },
            theme: {
              type: 'object',
              properties: {
                primary: { type: 'string', default: '#7C3AED' },
                font: { type: 'string', default: 'Inter' },
                radius: { type: 'string', default: '1rem' }
              }
            },
            seo: {
              type: 'object',
              properties: {
                title: { type: 'object' },
                description: { type: 'object' },
                ogImage: { type: 'string', format: 'uri' }
              }
            },
            sections: {
              type: 'array',
              items: {
                oneOf: [
                  { type: 'object', properties: { type: { enum: ['hero'] } } },
                  { type: 'object', properties: { type: { enum: ['schedule'] } } },
                  { type: 'object', properties: { type: { enum: ['venue'] } } },
                  { type: 'object', properties: { type: { enum: ['gallery'] } } },
                  { type: 'object', properties: { type: { enum: ['faq'] } } },
                  { type: 'object', properties: { type: { enum: ['rsvp'] } } },
                  { type: 'object', properties: { type: { enum: ['customHtml'] } } }
                ]
              }
            }
          },
          required: ['slug']
        },
        MicrositePublish: {
          type: 'object',
          properties: {
            publish: { type: 'boolean', default: true }
          }
        },
        MediaAsset: {
          type: 'object',
          properties: {
            url: { type: 'string', format: 'uri' },
            kind: { type: 'string', enum: ['image', 'video', 'file'] },
            alt: { type: 'string' },
            meta: { type: 'object' }
          },
          required: ['url', 'kind']
        }
      },
    },
    security: [{ bearerAuth: [] }],
    tags: [
      { name: 'Auth', description: 'Authentication endpoints' },
      { name: 'Events', description: 'Event management' },
      { name: 'Budget', description: 'Budget tracking' },
      { name: 'Checklist', description: 'Task checklist' },
      { name: 'Guests', description: 'Guest management' },
      { name: 'Seating', description: 'Seating arrangements' },
      { name: 'Microsite', description: 'Public microsites with bilingual content' },
    ],
    paths: {
      '/auth/register': {
        post: {
          tags: ['Auth'],
          summary: 'Register new user',
          requestBody: {
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Register' } } }
          },
          responses: {
            200: { description: 'User registered successfully' },
            400: { description: 'Bad Request' }
          }
        }
      },
      '/auth/login': {
        post: {
          tags: ['Auth'],
          summary: 'Login with email/password',
          requestBody: {
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Login' } } }
          },
          responses: {
            200: { description: 'Login successful' },
            401: { description: 'Invalid credentials' }
          }
        }
      },
      '/auth/google': {
        post: {
          tags: ['Auth'],
          summary: 'Google One-Tap / Sign-In',
          requestBody: {
            content: { 'application/json': { schema: { $ref: '#/components/schemas/GoogleOneTap' } } }
          },
          responses: {
            200: { description: 'Google authentication successful' },
            401: { description: 'Invalid Google token' }
          }
        }
      },
      '/users/me': {
        get: {
          tags: ['Users'],
          summary: 'Get current user',
          security: [{ bearerAuth: [] }],
          responses: {
            200: { description: 'User profile' },
            401: { description: 'Unauthorized' }
          }
        }
      },
      '/events': {
        post: {
          tags: ['Events'],
          summary: 'Create event',
          security: [{ bearerAuth: [] }],
          requestBody: {
            content: { 'application/json': { schema: { $ref: '#/components/schemas/CreateEvent' } } }
          },
          responses: {
            201: { description: 'Event created' },
            401: { description: 'Unauthorized' }
          }
        },
        get: {
          tags: ['Events'],
          summary: 'List events',
          security: [{ bearerAuth: [] }],
          responses: {
            200: { description: 'List of events' },
            401: { description: 'Unauthorized' }
          }
        }
      },
      '/events/{id}': {
        get: {
          tags: ['Events'],
          summary: 'Get event',
          security: [{ bearerAuth: [] }],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          responses: {
            200: { description: 'Event details' },
            404: { description: 'Not found' }
          }
        }
      },
      '/events/{eventId}/budget-items': {
        post: {
          tags: ['Budget'],
          summary: 'Create budget item',
          security: [{ bearerAuth: [] }],
          parameters: [{ name: 'eventId', in: 'path', required: true, schema: { type: 'string' } }],
          requestBody: {
            content: { 'application/json': { schema: { $ref: '#/components/schemas/BudgetItem' } } }
          },
          responses: {
            201: { description: 'Budget item created' }
          }
        },
        get: {
          tags: ['Budget'],
          summary: 'List budget items',
          security: [{ bearerAuth: [] }],
          parameters: [{ name: 'eventId', in: 'path', required: true, schema: { type: 'string' } }],
          responses: {
            200: { description: 'List of budget items' }
          }
        }
      },
      '/events/{eventId}/checklist': {
        post: {
          tags: ['Checklist'],
          summary: 'Create checklist item',
          security: [{ bearerAuth: [] }],
          parameters: [{ name: 'eventId', in: 'path', required: true, schema: { type: 'string' } }],
          requestBody: {
            content: { 'application/json': { schema: { $ref: '#/components/schemas/ChecklistItem' } } }
          },
          responses: {
            201: { description: 'Checklist item created' }
          }
        },
        get: {
          tags: ['Checklist'],
          summary: 'List checklist items',
          security: [{ bearerAuth: [] }],
          parameters: [{ name: 'eventId', in: 'path', required: true, schema: { type: 'string' } }],
          responses: {
            200: { description: 'List of checklist items' }
          }
        }
      },
      '/events/{eventId}/guests': {
        post: {
          tags: ['Guests'],
          summary: 'Create guest',
          security: [{ bearerAuth: [] }],
          parameters: [{ name: 'eventId', in: 'path', required: true, schema: { type: 'string' } }],
          requestBody: {
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Guest' } } }
          },
          responses: {
            201: { description: 'Guest created' }
          }
        },
        get: {
          tags: ['Guests'],
          summary: 'List guests',
          security: [{ bearerAuth: [] }],
          parameters: [{ name: 'eventId', in: 'path', required: true, schema: { type: 'string' } }],
          responses: {
            200: { description: 'List of guests' }
          }
        }
      },
      '/events/{eventId}/tables': {
        post: {
          tags: ['Seating'],
          summary: 'Create table',
          security: [{ bearerAuth: [] }],
          parameters: [{ name: 'eventId', in: 'path', required: true, schema: { type: 'string' } }],
          requestBody: {
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Table' } } }
          },
          responses: {
            201: { description: 'Table created' }
          }
        },
        get: {
          tags: ['Seating'],
          summary: 'List tables',
          security: [{ bearerAuth: [] }],
          parameters: [{ name: 'eventId', in: 'path', required: true, schema: { type: 'string' } }],
          responses: {
            200: { description: 'List of tables' }
          }
        }
      },
      '/events/{eventId}/microsite': {
        put: {
          tags: ['Microsite'],
          summary: 'Upsert microsite (draft)',
          security: [{ bearerAuth: [] }],
          parameters: [{ name: 'eventId', in: 'path', required: true, schema: { type: 'string' } }],
          requestBody: {
            content: { 'application/json': { schema: { $ref: '#/components/schemas/MicrositeUpsert' } } }
          },
          responses: {
            200: { description: 'Microsite upserted' }
          }
        },
        get: {
          tags: ['Microsite'],
          summary: 'Get microsite (admin)',
          security: [{ bearerAuth: [] }],
          parameters: [{ name: 'eventId', in: 'path', required: true, schema: { type: 'string' } }],
          responses: {
            200: { description: 'Microsite data' }
          }
        }
      },
      '/events/{eventId}/microsite/publish': {
        post: {
          tags: ['Microsite'],
          summary: 'Publish microsite',
          security: [{ bearerAuth: [] }],
          parameters: [{ name: 'eventId', in: 'path', required: true, schema: { type: 'string' } }],
          requestBody: {
            content: { 'application/json': { schema: { $ref: '#/components/schemas/MicrositePublish' } } }
          },
          responses: {
            200: { description: 'Microsite published' }
          }
        }
      },
      '/events/{eventId}/microsite/preview-token': {
        post: {
          tags: ['Microsite'],
          summary: 'Enable/disable preview token',
          security: [{ bearerAuth: [] }],
          parameters: [{ name: 'eventId', in: 'path', required: true, schema: { type: 'string' } }],
          requestBody: {
            content: { 'application/json': { schema: { type: 'object', properties: { enable: { type: 'boolean' } } } } }
          },
          responses: {
            200: { description: 'Preview token toggled' }
          }
        }
      },
      '/events/{eventId}/assets': {
        post: {
          tags: ['Microsite'],
          summary: 'Upload media asset',
          security: [{ bearerAuth: [] }],
          parameters: [{ name: 'eventId', in: 'path', required: true, schema: { type: 'string' } }],
          requestBody: {
            content: { 'application/json': { schema: { $ref: '#/components/schemas/MediaAsset' } } }
          },
          responses: {
            201: { description: 'Asset created' }
          }
        },
        get: {
          tags: ['Microsite'],
          summary: 'List media assets',
          security: [{ bearerAuth: [] }],
          parameters: [{ name: 'eventId', in: 'path', required: true, schema: { type: 'string' } }],
          responses: {
            200: { description: 'List of assets' }
          }
        }
      },
      '/m/{slug}': {
        get: {
          tags: ['Microsite'],
          summary: 'Get public microsite',
          parameters: [{ name: 'slug', in: 'path', required: true, schema: { type: 'string' } }],
          responses: {
            200: { description: 'Published microsite JSON' },
            404: { description: 'Not found' }
          }
        }
      },
      '/m/{slug}/preview': {
        get: {
          tags: ['Microsite'],
          summary: 'Preview draft microsite',
          parameters: [
            { name: 'slug', in: 'path', required: true, schema: { type: 'string' } },
            { name: 'token', in: 'query', required: true, schema: { type: 'string' } }
          ],
          responses: {
            200: { description: 'Draft microsite JSON' },
            401: { description: 'Invalid preview token' }
          }
        }
      }
    },
  };
}
