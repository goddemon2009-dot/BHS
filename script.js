navigator.serviceWorker.ready.then(() => {
    const savedVersion = localStorage.getItem("app_version");
    if (savedVersion !== APP_VERSION) {
        localStorage.setItem("app_version", APP_VERSION);

        if ('caches' in window) {
            caches.keys().then(function(names) {
                for (let name of names) caches.delete(name);
            });
        }

        location.reload(true);
    }
});


/* =========================================================
   ■ グローバル変数
   ========================================================= */
let allResults = [];      // 全お題の結果を保存
let selectedTopic = 1; // 現在のお題番号
let studentCount = 0;     // 受験者数
let studentNames = [];    // 受験者名リスト


/* =========================================================
   ■ 画面遷移（スタート → お題選択 → 人数 → 名前 → チェック）
   ========================================================= */

// スタート画面 → お題選び画面
function goToTop() {

    // ★ 完全初期化（次の受験者のためにまっさらにする）
    allResults = [];
    selectedTopic = 1;
    studentCount = 0;
    studentNames = [];

    // ★ 入力欄もリセット
    const countInput = document.getElementById("studentCount");
    if (countInput) countInput.value = "";

    const nameList = document.getElementById("nameList");
    if (nameList) nameList.innerHTML = "";

    const checkItems = document.getElementById("checkItems");
    if (checkItems) checkItems.innerHTML = "";

    // ★ トップ画面へ
    showScreen("topScreen");
}


// お題選び画面 → スタート画面（タイトルへ）
function goToStartScreen() {
    showScreen("startScreen");
}

// お題選択 → 人数入力
function selectTopic(num) {
    selectedTopic = num;
    showScreen("countScreen");
}

// 人数入力 → 名前入力
function goToNameInput() {
    studentCount = Number(document.getElementById("studentCount").value);

    if (studentCount < 1) {
        alert("人数を入力してください");
        return;
    }

    const nameList = document.getElementById("nameList");
    nameList.innerHTML = "";

    for (let i = 1; i <= studentCount; i++) {
        nameList.innerHTML += `
            <div class="nameRow">
                ${i}：<input type="text" id="name${i}" class="inputBox" placeholder="名前">
            </div>
        `;
    }

    showScreen("nameScreen");
}


// 名前入力 → チェック画面
function goToCheck() {
    studentNames = [];

    for (let i = 1; i <= studentCount; i++) {
        const name = document.getElementById(`name${i}`).value || `受験生${i}`;
        studentNames.push(name);
    }
   selectedTopic = 1;  // ← これが絶対必要！

-    generateCheckScreen();
-    showScreen("checkScreen");

+    showScreen("checkScreen");   // 先に画面を表示
+    generateCheckScreen();       // その後に内容を描画（ボタンも書き換わる）
}



/* =========================================================
   ■ 戻るボタン
   ========================================================= */
function backToTop() { showScreen("topScreen"); }
function backToCount() { showScreen("countScreen"); }
function backToNameInput() { showScreen("nameScreen"); }

function backToPreviousTopic() {
    if (selectedTopic > 1) {
        selectedTopic--;
        generateCheckScreen();
    } else {
        showScreen("nameScreen");
    }
}


/* =========================================================
   ■ 画面切り替え共通処理
   ========================================================= */
function showScreen(id) {
    document.querySelectorAll(".screen").forEach(s => s.classList.remove("active"));
    document.getElementById(id).classList.add("active");
}


/* =========================================================
   ■ お題データ（topics / topicNames）
   ========================================================= */
const topicNames = {
    1: "頭皮",
    2: "耳（日本手ぬぐい）",
    3: "顔",
    4: "口の中",
    5: "からだのまえ",
    6: "おなかをゆるめる",
    7: "てのひら",
    8: "足ゆびと足うら",
    9: "からだのうしろ",
    10: "ふともものまわりとおしり"
};

const topics = {
    1: [
        "スタートの位置があっている(頭蓋骨の下側の位置)",
        "指の腹で柔らかく毛の生え際から中央に向かってマッサージする",
        "横から前は髪の生え際から中央に向かってマッサージする",
        "8分割全てをマッサージ出来ている",
        "終わりの位置があっている"
    ],
    2: [
        "スタートの位置があっている(人差し指で耳の付け根)",
        "耳の付け根を剥がすイメージで、耳の後ろの周りをくるくるとマッサージする",
        "耳の一番下のところに人差し指をあてて、頭頂にむかって持ち上げる(頭がまっすぐになっている)",
        "人差し指で、耳のみぞを最後に耳の穴を洗う感じでマッサージする",
        "親指と中指で、上、真ん中、下の3方向に引っ張る",
        "終わりの位置があっている"
    ],
    3: [
        "手をあてる位置が合っている",
        "頬骨に親指が当たっている",
        "手のひらが頬を包み込んでいる",
        "耳を人差し指・中指が挟んでいる",
        "薬指が後頭部についている",
        "回し方（上→外→下）があっている"
    ],
    4: [
        "口角から指をいれている",
        "頬の内側を奥から頬を膨らませるようにできている",
        "奥からジグザクジグザグできている"
    ],
    5: [
        "スタートの位置があっている",
        "耳の後ろから頭蓋骨の下側に沿って首の後ろまで",
        "首の後ろから顎の下まで",
        "下顎の内側を顎の中央までさする",
        "鎖骨の上を横にタオルを振りながら",
        "肩の前側から脇の下をしっかりはいれる"
    ],
    6: [
        "手をあてる位置があっている",
        "片方の手を肋骨の下に手のひら全体で優しく当てることが出来る",
        "もう一方の手を背、肋骨、骨盤の間に中指を入れて手のひらで優しく包み込む",
        "ゆっくり呼吸に合わせて、手をお腹に沿わせておける"
    ],
    7: [
        "下の手（利き手ではない手）で丸く手のひらを支えることができる",
        "子供の手の中心に、（自分の利き手の）親指をあてることができる",
        "上の手で手のひらを、下の手で子供の手のひら全体でくるむように丸くできる",
        "親指と人差し指の間から、小指側の手首に向かって親指で生命線をなぞるイメージで斜め下に３回マッサージを行う",
        "利き手の親指と中指か人差し指で、子供の親指と小指の付け根の関節をくっつけるように、あわせる"
    ],
    8: [
        "鉛筆を持つように歯ブラシをもてる",
        "親指と人差し指の間にブラシを優しく入れることができる",
        "指の股をUの字状に①まっすぐ②親指側③人差し指とマッサージする",
        "全ての指を同様にマッサージできる",
        "爪のはえぎわを横にずらしながらマッサージできる",
        "指先の柔らかいところを横に流れるようにマッサージする",
        "指の付け根から、付け根の下、土踏まずより上（足裏の親指のポッコリしているところ）を大きく、くるくるマッサージできる",
        "かかと全体を、くるくると歯ブラシを回すことができる",
        "かかとから親指と人差し指の間に抜けてマッサージする"
    ],
    9: [
        "すべてスタートがあっている",
        "スタートの位置から、背骨の脇を縦にタオルでさする",
        "背骨の脇から、終了の位置があっている",
        "肩甲骨のうちにはいっている",
        "脇までの位置、終了の位置があっている",
        "背骨に近いところから骨盤の上を通ってウエストにぬける",
        "骨盤の上をぬけて前側まで"

    ],
    10: [
        "スタートの位置が正しい（身体をまっすぐにする）",
        "足の膝をもって、胸にまっすぐに近づけていく（膝を曲げてどの地土動くか確認する）",
        "左足：左手でふくらはぎの後ろを包み込むようにもつ。右手でひざをつつみ、足の中心の部分を膝からまっすぐ腹部に向かって、手をミトンのような形にしてマッサージする",
        "足を右側（外側）に倒し、右手で足を固定する",
        "左手で膝をつつみ、内側の大腿部分を膝から陰部に向かって、マッサージする",
        "小指が股関節にあたったら、親指をさらに深くマッサージできる",
        "左手で足を右手をちょうだいの手にして、大腿の裏側からお尻の部分を膝からお尻に向かってヒップアップをイメージしながらマッサージする",
        "一度足を中心に戻し、そのあとに左側（中側）に倒し、左手で足を固定する",
        "子供の太ももの外側の部分を右手で膝の部分からお尻に向かってマッサージする",
        "お尻のくぼんだ部分を右手の母指球の部分を使って、ぐるぐると体重をのせながら"
    ]
};


/* =========================================================
   ■ チェック画面の生成（入力保持版）
   ========================================================= */
function generateCheckScreen() {
    console.log("selectedTopic =", selectedTopic);
        const items = topics[selectedTopic];
console.log("items =", items);

    const topicName = topicNames[selectedTopic];

    let html = `<h2 class="subtitle">【${topicName}】</h2>`;

    items.forEach((item, itemIndex) => {
        html += `
        <div class="itemBlock">
  <div class="itemTitle">【${topicName}：項目${itemIndex + 1}】${item}</div>


            <div class="checksRow">
        `;

        studentNames.forEach((name, studentIndex) => {

            const saved = allResults.find(r =>
                r.topic === selectedTopic &&
                r.item === item &&
                r.name === name
            );

            const isChecked = saved && saved.check === "○" ? "on" : "";

            html += `
                <div class="checkCell">
                    <span class="checkName">${name}</span>
                    <div class="checkBox ${isChecked}" id="chk_${itemIndex}_${studentIndex}"
                         onclick="toggleCheck('${itemIndex}_${studentIndex}'); saveCheck('${itemIndex}', '${studentIndex}')"></div>
                </div>
            `;
        });

        html += `</div>`;

        html += `
            <div class="notesLabel">備考：</div>
            <div class="notesRow">
        `;

        studentNames.forEach((name, studentIndex) => {

            const saved = allResults.find(r =>
                r.topic === selectedTopic &&
                r.item === item &&
                r.name === name
            );

            const noteValue = saved ? saved.note : "";

            html += `
                <div class="noteCell">
                    ${name}：
                    <textarea id="note_${itemIndex}_${studentIndex}"
                              class="noteArea"
                              oninput="saveCheck('${itemIndex}', '${studentIndex}')">${noteValue}</textarea>
                </div>
            `;
        });



        html += `</div></div><hr>`;
    });

    document.getElementById("checkItems").innerHTML = html;


// ★ ここに追加する（ボタンのラベル切り替え）
const backBtn = document.querySelector(".backButton");
const nextBtn = document.querySelector(".nextButton");

// 項目1 → 「前の画面へ」
if (selectedTopic === 1) {
    backBtn.textContent = "前の画面へ";
} else {
    backBtn.textContent = "前の項目へ";
}

// 項目10 → 「完了」
if (selectedTopic === 10) {
    nextBtn.textContent = "完了";
} else {
    nextBtn.textContent = "次の項目へ";
}
}



/* =========================================================
   ■ チェックボタン ON/OFF
   ========================================================= */
function toggleCheck(id) {
    const el = document.getElementById("chk_" + id);
    el.classList.toggle("on");
}


/* =========================================================
   ■ 次へ（保存 → 次のお題 or 完了）
   ========================================================= */
function saveAndNext() {
    saveCurrentTopicToMemory();

    if (selectedTopic < 10) {
        selectedTopic++;
        generateCheckScreen();
    } else {
        saveAllExcel();
        showScreen("finishScreen");
    }
}


/* =========================================================
   ■ 現在のお題の結果を保存
   ========================================================= */
function saveCurrentTopicToMemory() {
    const items = topics[selectedTopic];

    studentNames.forEach((name, studentIndex) => {
        items.forEach((item, itemIndex) => {
            const checkBtn = document.getElementById(`chk_${itemIndex}_${studentIndex}`);
            const checked = checkBtn.classList.contains("on") ? "○" : "";
            const note = document.getElementById(`note_${itemIndex}_${studentIndex}`).value;

            // 既存データを更新
            let existing = allResults.find(r =>
                r.topic === selectedTopic &&
                r.item === item &&
                r.name === name
            );

            if (existing) {
                existing.check = checked;
                existing.note = note;
            } else {
                allResults.push({
                    topic: selectedTopic,
                    item: item,
                    name: name,
                    check: checked,
                    note: note
                });
            }
        });
    });
}


/* =========================================================
   ■ 入力内容を即時保存（チェック・備考）
   ========================================================= */
function saveCheck(itemIndex, studentIndex) {
    const item = topics[selectedTopic][itemIndex];
    const name = studentNames[studentIndex];

    const checkBtn = document.getElementById(`chk_${itemIndex}_${studentIndex}`);
    const checked = checkBtn.classList.contains("on") ? "○" : "";

    const note = document.getElementById(`note_${itemIndex}_${studentIndex}`).value;

    let existing = allResults.find(r =>
        r.topic === selectedTopic &&
        r.item === item &&
        r.name === name
    );

    if (existing) {
        existing.check = checked;
        existing.note = note;
    } else {
        allResults.push({
            topic: selectedTopic,
            item: item,
            name: name,
           check: checked,
            note: note
        });
    }
}


/* =========================================================
   ■ Excel 出力（受験者別シート + お題セル結合 + 中央揃え + 列幅90）
   ========================================================= */
function saveAllExcel() {
    const wb = XLSX.utils.book_new();

    studentNames.forEach(name => {
        const sheetData = [["お題", "項目", "チェック", "備考"]];
        const mergeRanges = [];

        let currentRow = 1;

        for (let topic = 1; topic <= 10; topic++) {
            const topicName = topicNames[topic];
            const items = topics[topic];
            const itemCount = items.length;

            mergeRanges.push({
                s: { r: currentRow, c: 0 },
                e: { r: currentRow + itemCount - 1, c: 0 }
            });

            items.forEach((item, itemIndex) => {
                const row = allResults.find(r =>
                    r.topic === topic &&
                    r.item === item &&
                    r.name === name
                );

                sheetData.push([
                    itemIndex === 0 ? topicName : "",
                    item,
                    row ? row.check : "",
                    row ? row.note : ""
                ]);

                currentRow++;
            });
        }

        const ws = XLSX.utils.aoa_to_sheet(sheetData);

        ws['!cols'] = [
            { wch: 23 },
            { wch: 90 },
            { wch: 10 },
            { wch: 90 }
        ];

 /* ▼ 全セルに折り返し設定（wrapText） */
const range = XLSX.utils.decode_range(ws['!ref']);
for (let R = 0; R <= range.e.r; R++) {
    for (let C = 0; C <= range.e.c; C++) {
        const cellAddress = XLSX.utils.encode_cell({ r: R, c: C });
        if (!ws[cellAddress]) continue;

        ws[cellAddress].s = {
            alignment: {
                wrapText: true,
                vertical: "top"
            }
        };
    }
}

/* ▼ A列のセル結合を適用（←先に結合） */
ws['!merges'] = mergeRanges;

/* ▼ A列（お題）だけ上下左右中央揃え（←結合後に適用） */
for (let i = 1; i < sheetData.length; i++) {
    const cellAddress = XLSX.utils.encode_cell({ r: i, c: 0 });
    if (ws[cellAddress]) {
        ws[cellAddress].s = {
            alignment: {
                horizontal: "center",
                vertical: "center",
                wrapText: true
            }
        };
    }
}


        ws['!merges'] = mergeRanges;

        XLSX.utils.book_append_sheet(wb, ws, name);
    });

    const today = new Date();
    const y = today.getFullYear();
    const m = String(today.getMonth() + 1).padStart(2, "0");
    const d = String(today.getDate()).padStart(2, "0");

    const fileName = `10BHS_${y}${m}${d}.xlsx`;

    XLSX.writeFile(wb, fileName);
}

