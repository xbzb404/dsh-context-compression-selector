# dsh-context-compression-selector

> 闈㈠悜 DeepSeek Harness 鐨勩€佸彲瀹¤鐨勫伐鍏风粨鏋滀笂涓嬫枃鍘嬬缉閫夋嫨鍣ㄣ€?
Compatible with: dsh `0.2.2-rc.3`锛堥€傞厤 `0.2.x`锛屽凡鍦?DeepSeek Harness 妗岄潰绔?`0.2.2-rc.3` 瀹炴祴锛夈€?
[English README](README.md) 路 [鎻愪氦闂](https://github.com/xbzb404/dsh-context-compression-selector/issues)

## 瀹夎

涓€鏉″懡浠わ紝鐩存帴浠庢湰浠撳簱瀹夎锛?
```sh
dsh plugin add github:xbzb404/dsh-context-compression-selector
dsh --dump-config   # 鑳界湅鍒?selector 杩欎竴灞傚嵆涓鸿濂?```

`dsh plugin add` 浼氭妸鏈粨搴撴牴鐩綍褰撲綔 Bundle锛氶噷闈㈠凡甯︾紪璇戝ソ鐨?`packages/selector/lib`銆乣cordis.patch.yml` 灞備笌娴忚鍣ㄧ浠ｇ爜锛屾湰鏈轰笉闇€瑕佹瀯寤恒€?鍐呴儴杩愯鏃跺寘锛坄dsh-context-compression-selector-runtime`锛夋槸鍞竴璧?registry 鐨勪竴鐜?鈥斺€攑npm 涓嶅厑璁?git 瀛愪緷璧栤€斺€斿畨瑁呮椂浼氳嚜鍔ㄨВ鏋愩€?
鍗囩骇 / 鍗歌浇锛?
```sh
dsh plugin up dsh-context-compression-selector
dsh plugin remove dsh-context-compression-selector
```

涓嶆兂鏁插懡浠わ紙Windows銆佹棤闇€ Node/npm/璐﹀彿锛夎鐪嬩笅闈㈢殑绂荤嚎瀹夎銆?
## 瀹夎锛圵indows 10/11锛屾棤闇€ Node / npm / 璐﹀彿锛?
**鏈€鐪佷簨鐨勫姙娉曪細涓嬭浇 鈫?瑙ｅ帇 鈫?鍙屽嚮銆?* 鍥涙锛屼笉鐢ㄦ暡浠讳綍鍛戒护銆?
1. 鍦ㄦ湰椤电偣缁胯壊鐨?**`Code`** 鎸夐挳 鈫?**`Download ZIP`**
   锛堢洿鎺ヤ笅杞介摼鎺ワ細<https://github.com/xbzb404/dsh-context-compression-selector/archive/refs/heads/main.zip>锛夈€?2. 鎶?zip 瑙ｅ帇鍒颁换鎰忕洰褰曪紝渚嬪 `D:\dsh-ctx`锛堝彸閿?鈫掋€屽叏閮ㄨВ鍘嬬缉銆嶏級銆?3. **瀹屽叏閫€鍑?DeepSeek Harness 鈥斺€?杩炴墭鐩樺浘鏍囦篃瑕侀€€鍑?*锛堝彸閿墭鐩樺浘鏍?鈫?閫€鍑猴級銆?4. 鍙屽嚮杩欎釜鏂囦欢锛?
   ```
   D:\dsh-ctx\dsh-context-compression-selector-main\release-package\install.cmd
   ```

   濡傛灉寮瑰嚭钃濊壊鐨勩€學indows 宸蹭繚鎶や綘鐨勭數鑴戙€嶆彁绀猴紝鐐?**鏇村淇℃伅** 鈫?**浠嶈杩愯**銆傝繖涓剼鏈彧鏄線浣犺嚜宸辩殑 Harness 閰嶇疆鐩綍閲屽鍒舵枃浠讹細涓嶈仈缃戜笅杞姐€佷笉璋冪敤 npm/pnpm銆佷篃涓嶉渶瑕佹敞鍐屾垨鐧诲綍浠讳綍璐﹀彿銆?
5. 鐪嬪埌 `=== done ===` 涔嬪悗锛岄噸鏂板惎鍔?DeepSeek Harness銆?
瀹夎鑴氭湰浼氳嚜鍔ㄥ畬鎴愯繖浜涗簨锛?
| 姝ラ | 鍋氫粈涔?|
|---|---|
| 1 | 澶囦唤 `%USERPROFILE%\.dsh\profiles\desktop\package.json` |
| 2 | 鎶婂畠 `vendor\` 閲岀殑 6 涓寘澶嶅埗鍒?`鈥profiles\desktop\node_modules\` |
| 3 | 鎶?`dsh-context-compression-selector` 娉ㄥ唽杩涜 Profile 鐨?`dsh.profile.bundles` |
| 4 | 閫愰」妫€鏌ュ叆鍙ｆ枃浠舵槸鍚﹀埌浣嶏紝缂轰粈涔堝氨鐩存帴鍛婅瘔浣?|

鐒跺悗鎵撳紑 **璁剧疆 鈫?Context compression**锛孭rofile 閫?**Balanced**锛屾柊浼氳瘽璇烽€夌敤 `standard--compression` 棰勮锛堣瑙乕妯″紡璇存槑](#profile-涓€瑙?锛夈€?
### 鍚屾牱鐨勫畨瑁咃紝鐢ㄥ懡浠ゅ畬鎴?
鎸?`Win + R`锛岃緭鍏?`cmd` 鍥炶溅鎵撳紑**鍛戒护鎻愮ず绗?*锛屼竴琛屼竴琛岀矘璐存墽琛屻€?
```cmd
:: 1. 涓嬭浇鏈粨搴撶殑 zip
powershell -NoProfile -Command "[Net.ServicePointManager]::SecurityProtocol='Tls12'; Invoke-WebRequest -Uri 'https://github.com/xbzb404/dsh-context-compression-selector/archive/refs/heads/main.zip' -OutFile '%USERPROFILE%\Downloads\dsh-ctx.zip'"

:: 2. 瑙ｅ帇
powershell -NoProfile -Command "Expand-Archive -Path '%USERPROFILE%\Downloads\dsh-ctx.zip' -DestinationPath '%USERPROFILE%\Downloads\dsh-ctx' -Force"

:: 3. 鍏堝畬鍏ㄩ€€鍑?DeepSeek Harness锛堝惈鎵樼洏鍥炬爣锛夛紝鍐嶅畨瑁?"%USERPROFILE%\Downloads\dsh-ctx\dsh-context-compression-selector-main\release-package\install.cmd"
```

宸茬粡瑁呬簡 `git` 鐨勮瘽锛屼袱琛屽氨澶燂細

```cmd
git clone https://github.com/xbzb404/dsh-context-compression-selector.git
dsh-context-compression-selector\release-package\install.cmd
```

瑁呭埌鍒殑 Profile銆佹垨 Harness 瀹剁洰褰曚笉鍦ㄩ粯璁や綅缃細

```cmd
:: 瑁呭埌 desktop 浠ュ鐨?Profile
...\release-package\install.cmd myprofile

:: Harness 瀹剁洰褰曚笉鏄?%USERPROFILE%\.dsh
set DSH_HOME=D:\dsh-home
...\release-package\install.cmd

:: 鏌ョ湅鍐呯疆甯姪
...\release-package\install.cmd --help
```

### 鍑洪棶棰樹簡鎬庝箞鍔?
| 浣犵湅鍒扮殑 | 鎬庝箞澶勭悊 |
|---|---|
| `[X] DeepSeek Harness is running.` | 娌￠€€骞插噣銆傝繛鎵樼洏鍥炬爣涓€璧烽€€鍑哄悗閲嶆柊杩愯鑴氭湰銆?|
| `[X] no Harness profile at 鈥 | 鍏堝惎鍔ㄤ竴娆?DeepSeek Harness 璁╁畠鐢熸垚 Profile锛岄€€鍑哄悗鍐嶈繍琛岃剼鏈€?|
| 鎯虫仮澶嶅師鐘?| 鑴氭湰浼氭墦鍗板浠借矾寰勶紝渚嬪 `copy /Y "鈥package.json.bak-install-12345" "鈥package.json"`锛涢殢鍚庝粠 `鈥profiles\desktop\node_modules` 閲屽垹鎺?`dsh-context-compression-selector`銆乣dsh-context-compression-selector-runtime`銆乣js-yaml`銆乣@huggingface`銆乣@deepseek-ai\dsh-compaction-basic`銆乣@deepseek-ai\dsh-command-compact` 鍏釜鏂囦欢澶瑰嵆鍙€?|
| 璁剧疆閲屾病鍑虹幇鏂颁笢瑗?| Host 鍗婅竟鍦ㄥ惎鍔ㄦ椂鍔犺浇锛岃閲嶅惎搴旂敤锛涘彟澶栬浼氳瘽蹇呴』閫夌敤 `--compression` 棰勮鎵嶄細鐪熸鍘嬬缉銆?|

<details>
<summary>涓轰粈涔堜笉鐢?<code>npm</code>/<code>pnpm</code> 鎴?<code>dsh</code> 鍛戒护瀹夎锛?/summary>

妗岄潰鐗?Profile 鐢?Electron 搴旂敤鑷繁绠＄悊銆備换浣曞寘绠＄悊鍣ㄦ墽琛岄兘浼氬湪鍚姩鍓嶉噸鍐?`node_modules`锛岃€?Harness 浼氭妸姣忎釜瀹㈡埛绔?bundle 鐨?`mtimeMs`/`ctimeMs`/`size` 鍝堝笇杩涘畠鐑樼剻鍒伴〉闈㈤噷鐨勬ā鍧楀浘 revision鈥斺€斾簬鏄覆鏌撹繘绋嬭姹傚埌鐨勬槸澶辨晥 URL锛屾暣涓缃潰鏉块兘浼氬姞杞藉け璐ャ€傚湪搴旂敤鍏抽棴鏃跺仛绾枃浠跺鍒跺彲浠ラ伩寮€杩欎釜闂锛岃€屼笖涓嶉渶瑕?Node銆乶pm 鎴栦换浣曡处鍙凤紱瀹屾暣璇存槑瑙?[`release-package/README.md`](release-package/README.md)銆?</details>


> [!NOTE]
> **鏈粨搴撴槸涓汉 fork**锛屾淳鐢熻嚜鍘?`dsh-context-compression-selector` 椤圭洰锛?> 鐜颁綔涓轰釜浜轰粨搴撶嫭绔嬬淮鎶ゃ€傚師椤圭洰鐨勮璁°€佸疄鐜颁笌閰嶅璇句欢鍧囦负涓婃父浣滆€呯殑宸ヤ綔锛?> MIT 璁稿彲璇佸強鍏舵潯娆惧師鏍锋部鐢ㄣ€?
> [!NOTE]
> **0.2.0-rc.1 鏇存柊鍐呭锛?*
>
> - **宸茶縼绉诲埌 Harness `0.2.0-rc.2`銆?* 鍘嬬缉鏀逛负浠?*娲剧敓棰勮鍙樹綋**锛坄<棰勮>--compression`锛夊舰寮忛€氳繃 0.2.0 鐨?`AgentPresetRegistry` 澹版槑锛屽彇浠?`0.1.x` 鐨勮矾寰勮楗版柟妗堛€?*浣犲師鏈夌殑棰勮缁濅笉浼氳鏀瑰啓銆?*
> - **璁剧疆鐢?Profile 琛屾湰韬彁渚涖€?* Bundle 鎻掑叆鐨勮 id 鏄?`context-compression`锛屽畠鍚屾椂涔熸槸璁剧疆 namespace锛屽洜姝ゆ祻瑙堝櫒绔€夋嫨鍣ㄨ鍙栫殑姝ｆ槸杩欎竴琛屽０鏄庣殑琛ㄥ崟銆?> - **鐜板凡鏀寔 DeepSeek-V4.1-Flash锛岃鐩?Harness 榛樿璺敱銆?* `deepseek-flash` 鍙В鏋愬嚭闅忓寘鎻愪緵鐨勭簿纭?tokenizer锛屼笉鍐嶅畨鍏ㄩ檷绾т负绌鸿浆銆?> - 瑙嗚鍥剧墖 token 绠楁湳宸叉寜瀹樻柟 V4.1 image processor 閲嶇Щ妞嶏細姣忓紶鍥剧墖涓婇檺 384 鈫?1024銆佹渶灏忓儚绱?147456 鈫?295936锛屼笖鍙栨秷浜嗗楂樻瘮瑁佸壀銆?>
> 瀹屾暣鍙戝竷鍘嗗彶瑙?[CHANGELOG.md](CHANGELOG.md)銆?
> [!IMPORTANT]
> 鏈」鐩洰鍓?*鍙敮鎸?DeepSeek 妯″瀷**銆傛棤鎹?token 娴嬮噺涓庢湁鎹熷伐鍏风粨鏋滃帇缂╀緷璧栭殢鍖呮彁渚涚殑 DeepSeek 瀹樻柟 tokenizer銆傛湰鐗堟湰绮剧‘鏀寔鐨勬ā鍨?id 涓?`deepseek-flash`銆乣deepseek-v4-flash`銆乣deepseek-v4-pro` 鍜?`deepseek-v4-flash-vision-exp`銆傚叾浠?DeepSeek Harness 妯″瀷锛堝寘鎷潪 DeepSeek 鎻愪緵鍟嗘ā鍨嬶級浼氬畨鍏ㄩ檷绾э紝淇濈暀鍘熷宸ュ叿缁撴灉銆?
## 瀹冭В鍐充粈涔堥棶棰?
闀挎湡杩愯鐨?Agent 浠诲姟浼氱Н绱ぇ閲忓伐鍏疯緭鍑恒€傛湰绀惧尯鎻掍欢鍦ㄤ笉淇敼 DeepSeek Harness 鏍稿績鐨勫墠鎻愪笅锛屼负杩欎簺宸ュ叿缁撴灉鎻愪緵鍙€夋嫨銆佸彲瀹¤鐨勪笂涓嬫枃鍘嬬缉绛栫暐銆?
- **Fresh**锛氬湪妯″瀷绗竴娆℃帴鏀跺墠锛屽鍒氬彉寰楄繃澶х殑宸ュ叿缁撴灉鐗囨杩涜棰勫帇缂┿€?- **Aggregate**锛氳嫢鏂伴矞鍐呭浠嶈秴杩囧凡閰嶇疆棰勭畻锛屽垯鍐嶆杩涜棰勫帇缂┿€?- **History / micro-compact**锛氬湪淇濈暀杩戞湡宸ヤ綔涓婁笅鏂囩殑鍓嶆彁涓嬶紝鏇挎崲绗﹀悎鏉′欢鐨勬棫宸ュ叿缁撴灉銆?- **TailTrim**锛氫粎 Custom 鍙惎鐢ㄧ殑銆佸彲閫夌殑灏鹃儴瑁佸壀璺緞銆?- **Native**锛氬皢 Harness 椋庢牸鐨勨€滀繚鐣欏ご灏俱€佽鎺変腑闂粹€濈殑宸ュ叿缁撴灉瑁佸壀淇濈暀涓轰竴涓槑纭?Profile銆?
鎻掍欢浼氳褰曞凡閫夋嫨鐨勭瓥鐣ュ強姣忔鍐崇瓥锛歴tage銆乺educer銆佽Е鍙戝師鍥犮€佽烦杩囧師鍥狅紝浠ュ強鍙敤鏃剁殑绮剧‘ token 鍓嶅悗鍊笺€?
## 璁剧疆鐣岄潰

鍦?DeepSeek Harness 璁剧疆涓€夋嫨鍘嬬缉 Profile锛屽苟鍦ㄥ悓涓€ section 璁剧疆 Auto Compact 瑙﹀彂姘翠綅銆備竴涓?Session 棣栨瑙傚療鍒伴厤缃悗浼氬喕缁撹閰嶇疆锛屽洜姝や箣鍚庝慨鏀硅缃彧浼氬奖鍝嶆柊 Session锛岃€屼笉浼氭倓鎮勬敼鍙樻鍦ㄨ繍琛岀殑浠诲姟銆?
Bundle 鐨?`cordis.patch.yml` 鍙彃鍏ヤ竴琛?Profile锛屽叾 id 鈥斺€?`context-compression` 鈥斺€?**灏辨槸**璁剧疆 namespace銆侶arness `0.2.0` 鎸夋瘡涓?Profile 琛岀殑 entry id 鎻愪緵瀵瑰簲鐨勮缃〃鍗曪紝鍥犳浣犲畨瑁呯殑閭ｄ竴琛屽氨鏄祻瑙堝櫒璇诲彇鐨勯偅寮犺〃鍗曪紝涓嶅瓨鍦ㄧ浜屼唤闇€瑕佸悓姝ョ殑鏂囨。銆傝嫢瑕侀噸鍛藉悕璇ヨ锛屽繀椤诲悓鏃堕噸鍛藉悕 `CONTEXT_COMPRESSION_SETTINGS_NAMESPACE`锛屽惁鍒欒〃鍗曚細琚绔嬨€?
### 鍘嬬缉鏄浣曡繘鍏?Session 鐨勶紙`0.2.0`锛?
Harness `0.2.0` 璁?`AgentPresetRegistry` 鎴愪负棰勮缁勫悎鐨勫敮涓€鏉冨▉锛氶璁剧敱瀹冪殑 owner 澹版槑锛坄register({ id, plugins })`锛夛紝鍙戠幇鏈哄埗涓嶅啀鎵弿鐩綍銆傚洜姝ゆ彃浠舵棤娉曞啀灏卞湴瑁呴グ鍒汉鐨勯璁撅紝`0.1.x` 鐨?overlay 鏈哄埗宸蹭笉澶嶅瓨鍦ㄣ€?
鏈?Bundle 鏀逛负澹版槑**娲剧敓鍙樹綋**锛氬娉ㄥ唽琛ㄥ凡鍒楀嚭鐨勬瘡涓€涓璁撅紝鎻掍欢娉ㄥ唽涓€涓悓婧愮殑鍏勫紵棰勮锛宨d 涓?`<鏉ユ簮>--compression`銆佸悕绉颁负 `<鏉ユ簮鍚? 路 Context compression`锛屽叾鏉＄洰鍒楄〃鏄潵婧愯嚜韬殑琛屽姞涓婂帇缂╂爤銆傚彉浣撴寜涓嶅悓鐨勫帇缂╅厤缃彂甯冧竴娆★紝骞跺甫寮曠敤璁℃暟锛屽洜姝ゅ唴缃涓?Bundle 琛岀粷涓嶄細瑁呭叆涓ゅ鍘嬬缉鏍堬紱琛岃閲婃斁鏃跺彧浼氭挙鍥炲畠鑷繁娉ㄥ唽鐨勯偅鎵瑰彉浣撱€傝鎻掍欢鎺掗櫎鐨勯璁俱€佷互鍙婅鏍囪涓?`broken` 鐨勯璁句笉浼氱敓鎴愬彉浣撱€?
鍦ㄤ綘鐨?Profile 涓€夋嫨鍙樹綋棰勮锛堜緥濡傜敤 `standard--compression` 鑰屼笉鏄?`standard`锛夊嵆鍙惎鐢ㄥ帇缂╋紱鏉ユ簮棰勮浠嶇収甯稿彲鐢ㄣ€?
鍙樹綋涔嬫墍浠ュ繀瑕侊紝鏄洜涓哄帇缂?runtime 蹇呴』涓庢秷璐瑰畠鐨?compactor 澶勪簬鍚屼竴涓?scope 缁勫唴锛氬畠鎻愪緵 `toolResultPruner`锛岃€?`dsh-compaction` 鍙細鍦ㄨ嚜宸遍殧绂荤殑 realm 涓В鏋愯鏈嶅姟銆傛妸 runtime 鎸傚湪鏍圭骇鏃犳硶瑙﹀強瀹?鈥斺€?棰勮缁勫悎鏄敮涓€鍙楁敮鎸佺殑璺緞銆?
### Auto Compact 闃堝€?
閫夋嫨鍣ㄨ缃〉鎻愪緵 `autoCompact.thresholdPercent`锛?0%鈥?0% 鐨勬暣鏁帮紙姝ラ暱 1%锛夛紝榛樿 80%銆傚彲鐩存帴鍦ㄨ緭鍏ユ濉啓 73% 绛変换鎰忓悎娉曞€笺€傝秴鍑烘帹鑽愬尯闂?70%鈥?5% 鏃朵細鏄剧ず椋庨櫓璇存槑锛屼絾浠嶇劧鍏佽淇濆瓨銆傝姘翠綅浼氫綔涓?`thresholdRatio` 鍐欏叆鐢熸垚鐨?`compaction-basic` 缁勫悎锛屽苟鍦ㄥ悓涓€娆¤鍙栦腑鍐欏叆鎻掍欢 runtime 鐨勯儴缃查厤缃紝鍥犳鍚屼竴涓?standing generation 缁濅笉浼氳 Auto Compact 涓?micro compact 杩愯鍦ㄤ袱涓笉鍚岄槇鍊间笂銆傚畠鎸?`A = floor(C 脳 a)`锛坄a = thresholdPercent / 100`锛屼互娴偣姣斾緥鍙備笌杩愮畻鈥斺€斾笌 `compaction-basic` 鑷韩鐨勮繍绠楅『搴忎竴鑷达級鑱斿姩鏍囧噯 Profile 鐨?History 瑙﹀彂鍊笺€佹渶灏忓洖鏀堕噺涓庤繎鏈熷熬绐楋紝浠ュ強 micro compact 鏈€鍚庢満浼氭按浣?`D = floor(A 脳 0.875)`銆傞粯璁?80% 鍦?1M 涓婁笅鏂囦笅瀹屽叏澶嶇幇鍘熸湁鏁板€笺€侳resh銆丄ggregate銆丯ative 鍗曠粨鏋滈绠椼€佽繎鏈?10 娆¤皟鐢ㄥ伐浣滈泦鍜?Auto Compact retain 姣斾緥鏈増淇濇寔涓嶅彉锛汣ustom 淇濇寔鎵嬪姩銆?
![涓婁笅鏂囧帇缂╅€夋嫨鍣ㄨ缃晫闈(docs/assets/context-compression-selector-settings.png)


## 閫傚悎璋佷娇鐢?
杩欐槸涓€涓珮绾ф彃浠躲€傚浜庝笉浜嗚В Agent 涓婁笅鏂囥€佸伐鍏风粨鏋滃帇缂┿€佷笂涓嬫枃绐楀彛銆丳rompt Cache锛屼互鍙娾€滅‘瀹氭€у伐鍏风粨鏋滃帇缂┾€濆拰鈥滄ā鍨嬮┍鍔?Auto Compact鈥濆尯鍒殑澶у鏁扮敤鎴疯€岃█锛屽畠骞朵笉鍙嬪ソ銆?
鑻ヨ繖浜涙蹇佃繕涓嶇啛鎮夛紝鏈彃浠跺彲鑳戒笉鏄悎閫傜殑璧风偣銆傚畠闇€瑕佷綘鍏堢悊瑙ｅ悇鏈哄埗銆丳rofile銆佸彇鑸嶅拰浣跨敤鏂规硶锛屽啀鍘讳慨鏀瑰帇缂╄缃€?
## 妯″瀷鏀寔涓庡畨鍏ㄨ竟鐣?
杩愯鏃堕殢鍖呮彁渚涘浐瀹氱増鏈殑 DeepSeek V4 瀹樻柟 tokenizer 璧勬簮锛屽苟楠岃瘉鍏?SHA-256銆傜簿纭?token 娴嬮噺鏄畨鍏ㄥ墠鎻愶細娌℃湁瀹冩椂锛屾彃浠朵笉浼氭墽琛屾湁鎹熸敼鍐欍€?
| 妯″瀷璺敱 | 鏈嶅姟妯″瀷 | 閫夋嫨鍣ㄥ帇缂?|
| --- | --- | --- |
| `deepseek-flash` | `DeepSeek-V4.1-Flash` | 鏀寔锛氭枃鏈簿纭鏁板強鏈夌晫鍥剧墖 token 浼扮畻锛涘惈鍥剧墖鐨勬敼鍐欏€欓€変粛涓嶅叿澶?exact 璧勬牸骞朵繚鎸佸師鏍?|
| `deepseek-v4-flash` | `DeepSeek-V4.1-Flash` | 鏀寔 |
| `deepseek-v4-flash-vision-exp` | `DeepSeek-V4.1-Flash` | 鏀寔锛氭枃鏈簿纭鏁板強鏈夌晫鍥剧墖 token 浼扮畻锛涘惈鍥剧墖鐨勬敼鍐欏€欓€変粛涓嶅叿澶?exact 璧勬牸骞朵繚鎸佸師鏍?|
| `deepseek-v4-pro` | `DeepSeek-V4-Pro` | 鏀寔 |
| 鍏朵粬 DeepSeek 妯″瀷 id | 鈥?| 涓嶆敮鎸侊紱瀹夊叏闄嶇骇 |
| DeepSeek Harness 涓殑闈?DeepSeek 妯″瀷 | 鈥?| 涓嶆敮鎸侊紱瀹夊叏闄嶇骇 |

V4.1-Flash 鍚勮矾鐢辩敱鎹嗙粦鐨勫畼鏂?tokenizer 鎻愪緵鏈嶅姟锛屽浐瀹氬湪 `deepseek-ai/DeepSeek-V4.1-Flash` revision `dba1be0a40aa45a94ad051997016db3960a90277`锛沗deepseek-v4-pro` 淇濈暀鑷繁鐙珛鍥哄畾鐨?`deepseek-ai/DeepSeek-V4-Pro` tokenizer銆備袱濂楄瘝琛ㄧ粷涓嶄簰涓哄埆鍚嶃€傝瑙夊浘鐗?token 浣跨敤瀹樻柟 V4.1 鍥惧儚澶勭悊绠楁湳鐨勯€愯绉绘璁＄畻锛坧atch 14銆乨ownsample 3銆?024 token 涓婇檺銆佹渶灏忓儚绱?295936锛屼笖瀹樻柟 config 灏?`max_wh_ratio` 鍥哄畾涓?`null` 鏁呮棤瀹介珮姣旇鍓級锛屽苟浠ュ畼鏂?Python 鍙傝€冨疄鐜扮敓鎴愮殑 golden fixtures 閫愰」楠岃瘉銆俈4.1 鐨勫潡闀垮害鎭掍负 `nLlmH * (nLlmW + 1) + 2`锛屼笉鍚换浣曞榻?padding锛屽洜姝や笌缁濆搴忓垪鍖栦綅缃棤鍏炽€傛湁鏁堝浘鐗囦互璇ュ潡闀垮害涓婃姤涓?`tokenizer-estimate`锛屽悓鏃朵繚鐣欐瘡寮犲浘鐗?1024 token 鐨勪繚瀹堜笂闄愶紱灏哄鐣稿舰鎴栨棤娉曡绠楁椂鍥哄畾璁′负 256 token锛屼笉鍐嶄娇鏁翠釜瑙嗚 surface 鍙樹负涓嶅彲鐢ㄣ€傝繖浜涙暟鍊间粛鏄及绠楋紝鍥犱负褰撳墠璁￠噺杈圭晫娌℃湁鍏紑 adapter 鏈€缁堣姹傚浘鐗囨姇褰憋紙鍖呮嫭鎸夎矾鐢辫鐩栧儚绱犻绠楀拰瀛楄妭涓婇檺浜屾鎶曞奖锛夛紱渚嬪 800脳800 涓婁紶琚姇褰变负 512脳512 鏃讹紝瀹為檯 token 浼氫笌 intrinsic 浼扮畻浜х敓杈冨ぇ宸紓銆備及绠楀€兼敼鍠勫帇鍔涚粺璁★紝浣嗕笉浼氭巿鏉冩湁鎹熸敼鍐欙細鍚浘鐗囩殑宸ュ叿缁撴灉鍊欓€変粛涓嶅叿澶?exact 璧勬牸锛屼笉浼氳鏀瑰啓銆佸垹闄ゆ垨鎸夐浂 token 璁°€傝嫢涓婃父浠ュ悗鍏紑鎶曞奖鍚庡昂瀵革紝鍗冲彲杩涗竴姝ュ崌绾т负绮剧‘璁℃暟銆?
鈥滃畨鍏ㄩ檷绾р€濊〃绀哄師濮嬪伐鍏风粨鏋滀細淇濈暀鍦ㄤ笂涓嬫枃涓紝骞朵骇鐢熷彲瀹¤鐨勮烦杩囨垨澶辫触璁板綍銆傞€夋嫨鍣ㄤ笉浼氫娇鐢ㄥ瓧绗︽暟浼扮畻 token锛屼篃涓嶈兘琚綋鎴愰€氱敤銆佸鎻愪緵鍟嗙殑鍘嬬缉鍣ㄣ€?
## 棰勫帇缂╀笌鍘嗗彶鍘嬬缉骞朵笉鐩稿悓

**Fresh 鍜?Aggregate 鏄鍘嬬缉锛屼笉鏄?History 鍘嬬缉銆?*瀹冧滑浼氬湪鏂板伐鍏风粨鏋滅涓€娆′氦缁欐ā鍨嬩箣鍓嶆墽琛屻€俽educer 浼氭牴鎹伐鍏峰悕銆佸懡浠ゅ弬鏁板拰鍐呭璇佹嵁閫夋嫨瀹夊叏绛栫暐锛屼緥濡?JSON銆佹悳绱€佹枃浠惰鍙栥€丟it銆佸寘绠＄悊銆佹瀯寤恒€佹祴璇曟垨 Shell 杈撳嚭銆傚畠浠彧闄愬埗鏂板鍔犵殑鍐呭锛屼笉浼氭敼鍐欏凡缁忓彂缁欐彁渚涘晢鐨勫簭鍒楀寲 prompt 鍓嶇紑锛屽洜姝や笉浼氱牬鍧忓凡鏈夌殑 Prompt Cache銆?
**History / micro-compact 鏄巻鍙插帇缂┿€?*瀹冧細閫夋嫨淇濇姢宸ヤ綔闆嗕箣澶栫殑鏃у伐鍏风粨鏋滐紝骞跺湪娲诲姩涓婁笅鏂囦腑灏嗘瘡涓€鏉￠€変腑鐨勭粨鏋滄浛鎹负鐭皬銆佸彲鎭㈠鐨勫琛屽崰浣嶈褰曪紱璇ヨ褰曚互 `[Old tool result content cleared from active context]` 寮€濮嬶紝骞朵繚鐣欏伐鍏峰悕銆佺姸鎬併€佹潵婧愬紩鐢ㄥ拰妫€绱㈡寚浠わ紝鍘熷鐨勬寔涔呭寲浜嬩欢浠嶅彲鎭㈠銆傚畠鏈夋剰鏀瑰啓宸茬粡鍙戦€佽繃鐨勫墠缂€锛屽洜姝や細鐮村潖鎴栭噸鏂板紑濮?Prompt Cache銆侶istory 鍦ㄥ鐞嗘棫缁撴灉鍓嶏紝浼氫繚鎶も€滄渶杩?10 娆?Agent 宸ュ叿璋冪敤鈥濆拰鈥滄渶杩?64,000 涓伐鍏风粨鏋?token鈥濈殑骞堕泦銆?
## Profile 濡備綍璇勪及

```mermaid
flowchart TD
    A[宸查€夋嫨鐨?Profile] --> B{Profile 绫诲瀷}
    B -- Off --> C[淇濇寔宸ュ叿缁撴灉涓嶅彉]
    B -- Native --> D[鍘熺敓澶?涓?灏惧伐鍏风粨鏋滆鍓猐
    B -- Balanced / Cache Strict / Savings / Adaptive / Custom --> E{婊¤冻 Fresh 鏉′欢锛焳
    E -- 鏄?--> F[Fresh]
    E -- 鍚?--> G{婊¤冻 Aggregate 鏉′欢锛焳
    F --> G
    G -- 鏄?--> H[Aggregate]
    G -- 鍚?--> I{婊¤冻 History 鏉′欢锛焳
    H --> I
    I -- 鏄?--> J[History / micro-compact]
    I -- 鍚?--> K{宸插惎鐢?Custom TailTrim 涓斿伐鍏风粍瀹夊叏锛焳
    J --> K
    K -- 鏄?--> L[TailTrim]
    K -- 鍚?--> M[淇濈暀鍏朵綑涓婁笅鏂嘳
    L --> M
    N[Harness/妯″瀷鍘熺敓 auto-compact] -. 鐙珛鏈哄埗 .-> M
```

涓€涓ā寮忓浜庘€滃惎鐢ㄢ€濈姸鎬侊紝涓嶈〃绀哄畠涓€瀹氫細杩愯銆傚畠鐨勯槇鍊笺€佸畨鍏ㄦ鏌ャ€佺簿纭?tokenizer 鍙敤鎬у拰鏈€浣庡洖鏀堕噺閮藉繀椤绘弧瓒炽€傞櫎 `native` 澶栵紝鎵€鏈夐€夋嫨鍣?Profile 閮戒細鍏抽棴 Harness 鍘熺敓鐨勫ご-涓?灏惧伐鍏风粨鏋滆鍓紝浣块€夋嫨鍣ㄦ垚涓哄敮涓€鐨勫伐鍏风粨鏋滃帇缂╁櫒銆傛ā鍨嬮┍鍔ㄧ殑鍘熺敓 auto-compact 浠嶆槸鐙珛鐨?Harness/妯″瀷鏈哄埗锛屾彃浠跺彧瀵瑰畠鍗曠嫭瀹¤銆?
## Profile 涓€瑙?
Profile 鏄紪鎺掔瓥鐣ワ紝涓嶆槸褰兼鐙珛鐨勫帇缂╃畻娉曘€備竴涓?Profile 浼氱粍鍚堣繖浜涘凡鏈夋柟娉曪紝鍐冲畾鍚敤鍝簺鏂规硶銆佽瘎浼伴『搴忋€侀槇鍊笺€佷繚鐣欏伐浣滈泦銆佹渶浣庡洖鏀堕噺浠ュ強缂撳瓨瀹夊叏鏂归潰鐨勫彇鑸嶃€?
| Profile | Fresh / Aggregate | History | 鍘熺敓宸ュ叿瑁佸壀 | TailTrim |
| --- | --- | --- | --- | --- |
| Off | 鍏抽棴 | 鍏抽棴 | 鍏抽棴 | 鍏抽棴 |
| Native | 鍏抽棴 | 鍏抽棴 | 鍚敤锛坄4096 鈫?2048`锛?| 鍏抽棴 |
| Balanced | `8192 鈫?3072` / `32768 鈫?12288` | `500000` 甯歌瑙﹀彂锛涗繚鎶ゆ渶杩?10 娆¤皟鐢ㄥ拰 64,000 token 灏剧獥 | 鍏抽棴 | 鍏抽棴 |
| Cache Strict | 涓?Balanced 鐩稿悓 | 瀹屾暣璇锋眰杈惧埌 `D = 700000` 鏃惰繘鍏ユ渶鍚庢満浼氾紱杈惧埌 `D` 鍚庯紝鍗充娇宸ュ叿缁撴灉 token 涓嶉珮浜?`H = 600000`锛宲lanner 涔熷彲浠ヨ繍琛?| 鍏抽棴 | 鍏抽棴 |
| Savings | `4096 鈫?1536` / `16384 鈫?4096` | `400000` 甯歌瑙﹀彂 | 鍏抽棴 | 鍏抽棴 |
| Adaptive | 涓?Balanced 鐩稿悓 | `500000` 涓嬪熀浜庝繚瀹堜及绠楃殑璺敱锛涘閲忓帇鍔涘彲浣滀负瀹夊叏瑕嗙洊 | 鍏抽棴 | 鍏抽棴 |
| Custom | 鍙厤缃?| 鍙厤缃?| 鍏抽棴 | 鍙€夛紝榛樿鍏抽棴 |

History 浼氫繚鎶も€滄渶杩?10 娆?Agent 宸ュ叿璋冪敤鈥濆拰鈥滄渶杩?64,000 涓伐鍏风粨鏋?token鈥濈殑骞堕泦銆傚彧鏈夎兘澶熸弧瓒宠绛栫暐鏈€浣庡洖鏀堕噺鏃讹紝杈冩棭涓斿悎鏍肩殑缁撴灉鎵嶄細琚敼鍐欍€傝〃涓?History 瑙﹀彂鍊笺€佹渶灏忓洖鏀堕噺涓庡熬绐楀潎涓?Auto Compact 榛樿姘翠綅 80% 涓嬬殑鏁板€硷紱璋冩暣闃堝€煎悗鎸?`A = floor(C 脳 a)`锛坄a = thresholdPercent / 100`锛屾诞鐐规瘮渚嬶級鍚屾瘮缂╂斁锛堣涓婃枃鈥淎uto Compact 闃堝€尖€濓級銆?
### Adaptive 鐨勫綋鍓嶉檺鍒朵笌涓婃父鑳藉姏璇锋眰

Adaptive 鍦ㄨ缃晫闈腑鏄剧ず涓?*淇濆畧鎴愭湰**銆傚畠鐩墠鏈夋剰涓嶆槸涓€涓畬缇庣殑鑷€傚簲缂撳瓨浼樺寲鍣細瀹冧緷鎹綋鍓嶅彲寰楃殑璇锋眰 usage銆佹ā鍨嬩环鏍煎拰鍚屼竴 tokenizer 鐨勬祴閲忕粨鏋滀綔淇濆畧浼扮畻锛涜繖浜涜緭鍏ヤ笉瀹屾暣鏃朵細瀹夊叏闄嶇骇銆傚畠鏃犳硶瑙傚療鎴栨帶鍒剁簿纭殑缂撳瓨鏂偣銆佺紦瀛樺垎閰嶅拰缂撳瓨瀛樻椿鏃堕棿銆?
瑕佸疄鐜板畬缇庣殑 Adaptive锛岄渶瑕?DeepSeek 鎻愪緵缂撳瓨鏂偣鎺у埗锛屼互鍙婄紦瀛?TTL/瀛樻椿鏃堕棿璇佹嵁銆傝繖浜涜兘鍔涚洰鍓嶆病鏈夐€氳繃 DeepSeek Harness 鎴栨彁渚涘晢鍏紑 API 鎻愪緵缁欐湰鎻掍欢銆備笂娓歌兘鍔涜姹傦細@deepseek-ai 鍜?[deepseek-ai/deepseek-harness](https://github.com/deepseek-ai/deepseek-harness)銆?
## 鍏煎鎬?
- 宸插熀浜?DeepSeek Harness `0.2.2-rc.3` 楠岃瘉锛屽苟涓斿彧浣跨敤鍏紑鐨勬彃浠朵笌 Profile API銆?- 闇€瑕?Node `^22.19.0 || >=24`銆?- **瑕佹眰 Harness `0.2.2-rc.3`銆?* 鏈垎鏀笌 `0.1.x` Harness 浜у搧绾?*涓嶅吋瀹?*锛氬凡鍙戝竷鐨?`0.1.1` 闈㈠悜 `dsh-v0.1.1-rc.2`锛岃€屾湰宸ヤ綔鏍戝凡杩佺Щ鍒?`0.2.2-rc.3` 鐨勫叕寮€ API 闈紙`AgentPresetRegistry.register()` 棰勮鍙樹綋銆乣SettingsForms.describe()` 璁剧疆璇诲彇銆乣ConfigForms` 椹卞姩鐨?`settings.section`銆乣snapshotEvents()` / `inheritedEventCount` 浼氳瘽璇诲彇銆佸甫鍝佺墝鐨?`SessionSeq`锛屼互鍙?`AgentLoop.create()` 杩斿洖 `Promise<Agent>`锛夈€傝杩?`0.1.x` Profile 浼氬姞杞藉け璐ャ€?- 鏈」鐩彧鍖呭惈璇?Bundle 涓?runtime锛屼笉 vendoring 鎴栦慨鏀?DeepSeek Harness 鏍稿績銆?- 杩欐槸闈炲畼鏂圭ぞ鍖洪」鐩紝涓?DeepSeek 涓嶅瓨鍦ㄩ毝灞炴垨鑳屼功鍏崇郴銆?
## 寮€鍙戜笌瀹夊叏

鍙娇鐢ㄤ互涓嬪懡浠よ繍琛岄潰鍚戝彂甯冪殑鏈湴妫€鏌ワ細

```sh
pnpm run typecheck
pnpm run test
pnpm run test:built
pnpm run test:e2e:packed
pnpm run verify:release
```

寮€鍙戠害瀹氳 [CONTRIBUTING.md](CONTRIBUTING.md)锛屽畨鍏ㄦ紡娲炴姤鍛婅 [SECURITY.md](SECURITY.md)锛宐undled tokenizer 鐨勬潵婧愪笌璁稿彲璇佽 [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md)銆?
## 瀹夎

### 浠庢簮鐮佸畨瑁咃紙鏈湴鏈彂甯冩瀯寤猴級

鏈伐浣滄爲鏄?**`0.2.2-rc.3`**锛岄潰鍚?Harness **`0.2.2-rc.3`**銆俷pm 涓?`latest` 閫氶亾褰撳墠鏄?**`0.1.1`**锛堥潰鍚?`dsh-v0.1.1-rc.2`锛屼笌鏈垎鏀笉鍏煎锛夈€傚洜姝よ鎸変笅闈㈢殑鏂瑰紡浠庢湰鍦?tarball 瀹夎銆?
```sh
# 1. 鏋勫缓涓や釜鍖咃紙鍐欏叆 lib/锛夊苟鎵撳寘鎴愭湰鍦?tarball銆?pnpm install
pnpm -r run bundle
cd packages/runtime  && pnpm pack --pack-destination ../../release-artifacts && cd ../..
cd packages/selector && pnpm pack --pack-destination ../../release-artifacts && cd ../..
```

杩欎細鍦?`release-artifacts/` 涓嬬敓鎴愪袱涓枃浠讹細

```
dsh-context-compression-selector-runtime-0.2.2-rc.3.tgz
dsh-context-compression-selector-0.2.2-rc.3.tgz
```

鐒跺悗**涓€璧?*瀹夎鍒扮洰鏍?Profile锛?
```sh
cd ~/.dsh/profiles/<profile>

# 鍏堟妸 runtime 绮剧‘渚濊禆 pin 鍒版湰鍦?tarball锛堣涓嬫柟璇存槑锛岃繖涓€姝ヤ笉鍙渷鐣ワ級
# 鍦?pnpm-workspace.yaml 鏈熬杩藉姞锛?#   overrides:
#     dsh-context-compression-selector-runtime: file:<缁濆璺緞>/release-artifacts/dsh-context-compression-selector-runtime-0.2.2-rc.3.tgz

pnpm add --registry=https://registry.npmmirror.com file:<缁濆璺緞>/release-artifacts/dsh-context-compression-selector-runtime-0.2.2-rc.3.tgz
pnpm add --registry=https://registry.npmmirror.com file:<缁濆璺緞>/release-artifacts/dsh-context-compression-selector-0.2.2-rc.3.tgz
```

#### 涓轰粈涔堝繀椤诲啓 `overrides`

閫夋嫨鍣ㄦ妸 runtime 渚濊禆澹版槑涓?*绮剧‘鐗堟湰**锛坄"dsh-context-compression-selector-runtime": "0.2.2-rc.3"`锛夈€傚寘绠＄悊鍣ㄦ瘡娆?`add` 閮戒細閲嶆柊瑙ｆ瀽鏁存５渚濊禆鏍戯紝浜庢槸锛?
- 鍙閫夋嫨鍣?tarball 鈫?鎸?*鍘熷悕**鍘?registry 鎵?`0.2.2-rc.3`锛岃€屾湰 fork 鍙戝竷鐨勪笉鏄繖涓悕瀛?鈫?`ERR_PNPM_NO_MATCHING_VERSION`锛?- **鍏堣 runtime 鍐嶈閫夋嫨鍣ㄤ篃鏃犳晥** 鈥斺€?绗簩姝ョ収鏍峰洖 registry 瑙ｆ瀽閭ｄ釜鍚嶅瓧锛岀粨鏋滅浉鍚岋紱
- 涓€娆′紶鍏ヤ袱涓?tarball 涔熶笉琛?鈥斺€?pnpm 浼樺厛鏌?registry锛屼笉浼氶噰鐢ㄥ悓涓€鍛戒护琛岄噷鐨勫彟涓€涓?tarball銆?
`overrides` 鏄妸璇ヤ緷璧栭拤鍒版湰鍦版枃浠剁殑鍙鍋氭硶銆傚畠蹇呴』鍐欏湪 profile 鐨?`pnpm-workspace.yaml` 閲岋細**pnpm 11 宸蹭笉鍐嶈鍙?`package.json` 鐨?`pnpm` 瀛楁**锛堝啓鍦ㄩ噷闈細鎵撳嵃璀﹀憡骞堕潤榛樺け鏁堬級銆?
鐪熸鐪佷簨鐨勮矾寰勬槸涓婇潰鐨?GitHub 瀹夎锛氭牴 manifest 鐢?`npm:` 鍒悕鎶婅繖涓悕瀛楁槧灏勫埌 `@xbzb404/dsh-context-compression-selector-runtime`锛宲npm 浼氱洿鎺ヤ粠 registry 瑙ｆ瀽锛屼笉闇€瑕佸啓 override銆?
> **娉ㄦ剰**锛歚overrides` 閲岀殑璺緞鏄?*鏈満缁濆璺緞**锛屽洜姝や笉闅忓寘鍒嗗彂 鈥斺€?姣忎綅鐢ㄦ埛閮借鎸夎嚜宸辩殑瑙ｅ帇浣嶇疆鏀逛竴娆°€?
#### 涓€閿剼鏈紙鎺ㄨ崘锛?
鏈粨搴撴彁渚?`scripts/install-from-tarballs.mjs`锛屽畠浼氳嚜鍔ㄥ畬鎴愪笂闈㈠叏閮ㄦ楠わ紙鍚?override 鍐欏叆銆丅undle 娉ㄥ唽涓庡畨瑁呭悗鏍￠獙锛夛紝骞跺彲鐢?`--profile` 鎸囧畾鐩爣锛?
```sh
node scripts/install-from-tarballs.mjs --profile <profile>
```

鑴氭湰浼氬厛澶囦唤 `package.json`锛涘け璐ユ椂鍙洿鎺ヤ粠澶囦唤鍥炴粴銆傚彲閫夊弬鏁帮細`--registry <url>`銆乣--dry-run`銆?
#### `dsh plugin add github:` 杩欐潯璺緞鐜板湪鏄€庝箞閫氱殑

pnpm 瑙ｆ瀽 git 渚濊禆鐨勮嚜韬緷璧栨椂鍙煡 registry锛屼笉鍋氫粨搴撳唴鐩稿瑙ｆ瀽锛沺npm 10 璧锋洿鏄洿鎺ョ姝?git/URL 褰㈠紡鐨?*瀛愪緷璧?*锛坄ERR_PNPM_EXOTIC_SUBDEP`锛夈€傛墍浠ュ彧鏈変竴澶勫繀椤昏惤鍦?registry锛歳untime 鍖咃紝鐢变綔鑰呭彂甯冨埌鑷繁鐨?scope锛屽啀閫氳繃鏍?manifest 閲岀殑 `npm:` 鍒悕鏄犲皠鍥炲師鍖呭悕銆傚叾浣欓儴鍒嗏€斺€斿涓诲崐銆佹祻瑙堝櫒鍗娿€乸atch 灞傘€佹瀯寤轰骇鐗┾€斺€斿叏閮ㄩ殢 git 妫€鍑轰竴璧蜂笅鍙戯紝鍥犳 `lib/` 蹇呴』淇濇寔鎻愪氦鐘舵€侊紝鐢ㄦ埛鏈満涓嶈窇鏋勫缓銆?
閲嶅缓 / 閲嶅彂 runtime锛歚node scripts/publish-runtime.mjs`锛堣瘯璺戯級/ `--publish`銆?
涓嬮潰鐨?tarball 娴佺▼浠嶉€傜敤浜庣绾挎満鍣ㄣ€?

### 涓婃父宸插彂甯冨寘锛坄0.1.1`锛岄潰鍚?`0.1.x` Harness锛?
> 娉ㄦ剰锛歚dsh-context-compression-selector` 杩欎釜 npm 鍖呭悕灞炰簬鏈粨搴撴墍淇鐨勪笂娓搁」鐩紝`@latest` 瑁呭埌鐨勬槸涓婃父鏋勫缓锛屼笉鏄湰浠撳簱鐨勪慨澶嶇増銆傚彧鍦ㄤ綘鐨?Profile 鏄?`dsh-v0.1.1-rc.2` 鏃舵墠鑰冭檻浣跨敤锛屼笖涓嶈涓庢湰浠撳簱鐗堟湰娣疯锛?
```sh
dsh plugin --profile <profile> add dsh-context-compression-selector@latest
dsh --profile <profile> --dump-config
```

瀹夎鍚庨噸鍚搴?Profile銆傞厤缃鍑轰腑搴旀樉绀洪€夋嫨鍣?Bundle 宸叉縺娲汇€傛洿鏂版垨鍗歌浇锛?
```sh
dsh plugin --profile <profile> up dsh-context-compression-selector@latest
dsh plugin --profile <profile> remove dsh-context-compression-selector
```

閫夋嫨鍣ㄥ寘鍦?manifest 涓０鏄庝簡 Harness Bundle 瀛楁 `dsh.bundle.patch`锛屽洜姝?`dsh plugin --profile <name> add <package>` 鏄鍚堣鑼冪殑鏍戝 Bundle 瀹夎鏂瑰紡銆傛彃浠跺彧浣跨敤 Harness 鐨勫叕寮€鎵╁睍 API锛屼笉浼氫慨鏀?Harness 鏍稿績浠ｇ爜銆?