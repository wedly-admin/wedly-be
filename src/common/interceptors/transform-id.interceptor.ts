import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from "@nestjs/common";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";

/**
 * Interceptor that transforms 'id' fields to '_id' to match MongoDB/frontend conventions
 * This runs on all responses globally
 */
@Injectable()
export class TransformIdInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(map((data) => this.transformId(data)));
  }

  private transformId(data: any): any {
    if (data === null || data === undefined) {
      return data;
    }

    // Handle arrays
    if (Array.isArray(data)) {
      return data.map((item) => this.transformId(item));
    }

    // Handle objects
    if (typeof data === "object") {
      const transformed: any = {};

      for (const key in data) {
        if (data.hasOwnProperty(key)) {
          // Map 'id' to '_id'
          if (key === "id") {
            transformed._id = data[key];
          } else {
            // Recursively transform nested objects
            transformed[key] = this.transformId(data[key]);
          }
        }
      }

      return transformed;
    }

    // Return primitives as-is
    return data;
  }
}
