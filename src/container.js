export default class Container {
  constructor() {
    this.registrations = {};
  }

  register = (Target, factory) => {
    if (typeof factory !== 'function') {
      throw new Error(`Container registration '${Target}' was not a function`);
    }

    this.registrations[Target] = factory;
  }

  resolve = (Target, args = {}) => {
    if (this.registrations[Target]) {
      return this.registrations[Target](this);
    }

    if (!(Target instanceof constructor)) {
      throw new Error(`Registration not found: "${Target}"`);
    }

    return new Target(...(Target.__ctorArgs || []).map(arg => args[arg] || args[arg?.name] || this.resolve(arg)));
  }
}

export function inject(...args) {
  return (Target, property, description) => {
    Target.__ctorArgs = args;
  };
}
