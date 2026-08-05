import { SetMetadata } from '@nestjs/common';

export const AllowAnonymous = () => SetMetadata('testAllowAnonymous', true);
export const OptionalAuth = () => SetMetadata('testOptionalAuth', true);
export const Roles = (roles: string[]) => SetMetadata('testRoles', roles);
