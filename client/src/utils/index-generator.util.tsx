/**
 * Service expected to be singleton that generates unique indexes inside app.
 */
export class IndexGenerator {
    private static index: number = 0;
    static getIndex = () => IndexGenerator.index++
}