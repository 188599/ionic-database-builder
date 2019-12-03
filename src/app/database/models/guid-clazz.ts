export class GuidClazz {
    get guid(): string {
        return this._guid;
    }
    set guid(theBar: string) {
        this._guid = theBar;
    }

    constructor(
        private _guid?: string,
        public description?: string
    ) {

    }
}
