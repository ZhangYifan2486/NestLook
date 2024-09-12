// 定义泛型类

export class DataObj<A> {
  private data: A;
  constructor(data: A) {
    this.data = data;
  }
  static create<A>(data: A) {
    return new DataObj<A>(data);
  }
}
