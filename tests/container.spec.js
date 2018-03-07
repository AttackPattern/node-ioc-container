import chai, { expect } from 'chai';
import chaiAsPromised from 'chai-as-promised';
chai.use(chaiAsPromised);

import Container, { inject } from '../src/container.js';

describe('Container', () => {
  it('should use factory to resolve simple type', async () => {
    const container = new Container();
    let target = new TestClass_EmptyConstructor();
    container.register(TestClass_EmptyConstructor, () => target);

    let resolved = container.resolve(TestClass_EmptyConstructor);

    expect(resolved).to.equal(target);
  });

  it('should construct class when type is not registered', () => {
    const container = new Container();

    let resolved = container.resolve(TestClass_EmptyConstructor);

    expect(resolved).to.be.instanceof(TestClass_EmptyConstructor);
  });

  it('should create new instances when type is not registered', () => {
    const container = new Container();

    expect(container.resolve(TestClass_EmptyConstructor)).to.not.equal(container.resolve(TestClass_EmptyConstructor));
  });

  it('should fill injected constructor arguments', () => {
    const container = new Container();
    container.register(TestDependency, () => new TestDependency('testDependency'));

    let resolved = container.resolve(TestClass_WithDependencies);

    expect(resolved.dependency.message).to.equal('testDependency');
    expect(resolved.testClass).to.be.instanceof(TestClass_EmptyConstructor);
  });

  it('should fill allow derived dependencies', () => {
    const container = new Container();
    container.register(TestDependency, () => new DerivedTestDependency('testDependency'));

    let resolved = container.resolve(TestClass_WithDependencies);

    expect(resolved.dependency.message).to.equal('derived: testDependency');
  });

  it('should resolve unregistered dependency', () => {
    const container = new Container();

    let resolved = container.resolve(TestClass_WithDependencies);

    expect(resolved.dependency).to.be.instanceof(TestDependency);
  });

  it('should resolve named registration', () => {
    const container = new Container();
    container.register('message', () => 'test message');

    let resolved = container.resolve(TestClass_WithStringDependency);

    expect(resolved.message).to.equal('test message');
  });

  it('should pass container in registered factory callback', () => {
    const container = new Container();
    container.register(TestDependency, c => {
      expect(c).to.equal(container);
    });
    container.resolve(TestDependency);
  });

  it('should gracefully fail unregistered named registration', () => {
    const container = new Container();

    expect(() => container.resolve(TestClass_WithStringDependency))
      .to.throw(Error, 'Registration not found: "message"');
  });

  it('should throw when registering a non-function factory', () => {
    const container = new Container();

    expect(() => container.register('non-function'))
      .to.throw(Error, 'Container registration \'non-function\' was not a function');
  });

  it('should use supplied string arguments in resolve', () => {
    const container = new Container();

    container.register('dependency1', () => 'registered-1');
    container.register('dependency2', () => 'registered-2');

    const resolved = container.resolve(TestClass_WithMultipleStringDependencies, { dependency2: 'supplied' });

    expect(resolved.dependency1).to.equal('registered-1');
    expect(resolved.dependency2).to.equal('supplied');
  });

  it('should use supplied type arguments in resolve', () => {
    const container = new Container();

    container.register(TestDependency, () => new TestDependency('registered'));

    const resolved = container.resolve(TestClass_WithDependencies, { TestDependency: new TestDependency('supplied') });
    expect(resolved.dependency.message).to.equal('supplied');
  });
});

class TestDependency {
  constructor(message) {
    this.message = message;
  }
}

class DerivedTestDependency extends TestDependency {
  constructor(message) {
    super('derived: ' + message);
  }
}

class TestClass_EmptyConstructor { }

@inject(TestDependency, TestClass_EmptyConstructor)
class TestClass_WithDependencies {
  constructor(dependency, testClass) {
    this.dependency = dependency;
    this.testClass = testClass;
  }
}

@inject('message')
class TestClass_WithStringDependency {
  constructor(message) {
    this.message = message;
  }
}

@inject('dependency1', 'dependency2')
class TestClass_WithMultipleStringDependencies {
  constructor(dependency1, dependency2) {
    this.dependency1 = dependency1;
    this.dependency2 = dependency2;
  }
}
