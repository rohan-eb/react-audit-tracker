import {
  AuditEvent,
  StorageAdapter,
  QueryOptions,
  PaginatedResult,
} from '../types';

/**
 * Firebase configuration
 */
export interface FirebaseConfig {
  apiKey?: string;
  authDomain?: string;
  projectId?: string;
  storageBucket?: string;
  messagingSenderId?: string;
  appId?: string;
  databaseURL?: string;
  collectionName?: string; // Firestore collection name (default: 'audit_events')
  config?: {  // Support nested config structure
    apiKey: string;
    authDomain?: string;
    projectId: string;
    storageBucket?: string;
    messagingSenderId?: string;
    appId?: string;
    databaseURL?: string;
  };
}

/**
 * Firebase adapter for audit events
 * Works with Firebase Firestore
 */
export class FirebaseAdapter implements StorageAdapter {
  private config: FirebaseConfig;
  private db: any;
  private collection: any;
  private initialized: boolean = false;

  constructor(config: FirebaseConfig) {
    // Support both flat and nested config structures
    const flatConfig = config.config || config;
    this.config = {
      ...flatConfig,
      collectionName: config.collectionName || 'audit_events',
    };
  }

  /**
   * Initialize Firebase (lazy loading)
   */
  private async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      // Dynamic import to avoid bundling Firebase if not used
      const { initializeApp, getApps } = await import('firebase/app');
      const { getFirestore, collection } = await import('firebase/firestore');

      // Use existing Firebase app or initialize new one
      let app;
      const existingApps = getApps();
      
      if (existingApps.length > 0) {
        // Reuse existing app
        app = existingApps[0];
      } else {
        // Initialize new app
        app = initializeApp({
          apiKey: this.config.apiKey,
          authDomain: this.config.authDomain,
          projectId: this.config.projectId,
          storageBucket: this.config.storageBucket,
          messagingSenderId: this.config.messagingSenderId,
          appId: this.config.appId,
          databaseURL: this.config.databaseURL,
        });
      }

      this.db = getFirestore(app);
      this.collection = collection(this.db, this.config.collectionName!);
      this.initialized = true;
    } catch (error) {
      console.error('Failed to initialize Firebase:', error);
      throw new Error(
        'Firebase initialization failed. Make sure firebase/app and firebase/firestore are installed.'
      );
    }
  }

  /**
   * Save an audit event to Firebase Firestore
   */
  async save(event: AuditEvent): Promise<void> {
    try {
      await this.initialize();

      const { addDoc } = await import('firebase/firestore');

      // Add timestamp if not provided
      const eventData: AuditEvent = {
        ...event,
        id: event.id || this.generateId(),
        timestamp: event.timestamp || Date.now(),
      };

      // Save to Firestore
      const docData = {
        ...eventData,
        createdAt: new Date().toISOString(),
      };
      
      await addDoc(this.collection, docData);
    } catch (error) {
      throw new Error(`Failed to save audit event to Firebase: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Query audit events from Firebase Firestore
   */
  async query(options?: QueryOptions): Promise<PaginatedResult<AuditEvent>> {
    try {
      await this.initialize();

      const {
        query: firestoreQuery,
        where,
        orderBy,
        limit: firestoreLimit,
        getDocs,
      } = await import('firebase/firestore');

      let q = firestoreQuery(this.collection);

      // Apply filters
      if (options?.filter) {
        const filter = options.filter;
        
        if (filter.action) {
          q = firestoreQuery(q, where('action', '==', filter.action));
        }
        if (filter.entity) {
          q = firestoreQuery(q, where('entity', '==', filter.entity));
        }
        if (filter.entityId) {
          q = firestoreQuery(q, where('entityId', '==', filter.entityId));
        }
        if (filter.userId) {
          q = firestoreQuery(q, where('userId', '==', filter.userId));
        }
        if (filter.startDate) {
          q = firestoreQuery(q, where('timestamp', '>=', filter.startDate));
        }
        if (filter.endDate) {
          q = firestoreQuery(q, where('timestamp', '<=', filter.endDate));
        }
      }

      // Apply sorting
      const sortField = options?.sort?.field || 'timestamp';
      const sortDirection = options?.sort?.direction || 'desc';
      q = firestoreQuery(q, orderBy(sortField, sortDirection));

      // Apply pagination
      const page = options?.pagination?.page || 1;
      const pageSize = options?.pagination?.pageSize || 10;
      
      // For pagination, we need to fetch one extra to check if there are more pages
      q = firestoreQuery(q, firestoreLimit(pageSize));

      // Execute query
      const querySnapshot = await getDocs(q);
      
      const events: AuditEvent[] = [];
      querySnapshot.forEach((doc: any) => {
        const data = doc.data();
        events.push({
          id: doc.id,
          action: data.action,
          entity: data.entity,
          entityId: data.entityId,
          userId: data.userId,
          userName: data.userName,
          description: data.description,
          metadata: data.metadata,
          timestamp: data.timestamp,
          ipAddress: data.ipAddress,
          userAgent: data.userAgent,
        });
      });

      // For simplicity, we'll return the current page without total count
      // To get total count, you'd need a separate query which counts all matching docs
      const total = events.length; // This is an approximation
      const totalPages = Math.ceil(total / pageSize);

      return {
        data: events,
        total,
        page,
        pageSize,
        totalPages,
      };
    } catch (error) {
      console.error('Failed to query audit events from Firebase:', error);
      throw new Error('Failed to query audit events from Firebase');
    }
  }

  /**
   * Clear all audit events (optional)
   */
  async clear(): Promise<void> {
    try {
      await this.initialize();

      const { getDocs, deleteDoc, doc } = await import('firebase/firestore');

      const querySnapshot = await getDocs(this.collection);
      
      const deletePromises = querySnapshot.docs.map((document: any) =>
        deleteDoc(doc(this.db!, this.config.collectionName, document.id))
      );

      await Promise.all(deletePromises);
    } catch (error) {
      console.error('Failed to clear audit events from Firebase:', error);
      throw new Error('Failed to clear audit events from Firebase');
    }
  }

  /**
   * Generate a unique ID
   */
  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}
