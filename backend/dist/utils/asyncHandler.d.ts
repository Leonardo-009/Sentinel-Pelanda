import type { Request, Response, NextFunction } from "express";
export declare const asyncHandler: (fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown> | unknown) => (req: Request, res: Response, next: NextFunction) => void;
//# sourceMappingURL=asyncHandler.d.ts.map