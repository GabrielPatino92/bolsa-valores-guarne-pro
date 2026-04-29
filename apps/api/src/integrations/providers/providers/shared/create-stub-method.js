import { AppError } from '../../../../shared/errors/app-error.js';

export function createStubMethod(providerName, capability, methodName) {
  return async function providerStubMethod() {
    throw new AppError(
      `${providerName} ${capability} adapter method ${methodName} is not implemented yet`,
      {
        statusCode: 501,
        code: 'provider_capability_not_implemented',
        details: {
          providerName,
          capability,
          methodName
        }
      }
    );
  };
}
