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
      }
    },
  };
}
