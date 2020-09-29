/**
 * base の構造を保ったまま深いコピーを行う
 * base の関数を上書きしない
 * @param base プロパティの参照元かつコピー先
 * @param source コピー元
 * @returns コピーしたその値
 */
export function deepCopy(base: any, source: any): any
{
    switch (typeof base) {
        // 数値と文字列はそのままコピー
        // 値渡しなので戻り値で返す
        case 'number':case 'string':
            return source;
        // オブジェクトはnullならコピー
        // そうでないなら深く入る
        case 'object':
            if (base == null) {
                return source;
            }
            for (let p of Object.getOwnPropertyNames(base)) {
                base[p] = deepCopy(base[p], source[p]);
            }
            return base;
        case 'function':
            // そのまま返す
            return base;
        // そのまま返す
        default:
            return source;
    }
}