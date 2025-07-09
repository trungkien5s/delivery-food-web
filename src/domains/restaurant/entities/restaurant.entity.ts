export class Restaurant {
constructor(
  public readonly id: string,
  public readonly name: string,
  public readonly phone: string,
  public readonly email: string,
  public readonly address: string,
  public readonly description?: string,
  public readonly image?: string,
  public readonly rating?: number,
  public readonly isOpen?: boolean,
  public readonly openTime?: string,
  public readonly closeTime?: string,
) {}

}