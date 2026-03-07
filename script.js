/* =========================================================
   ■ バージョン更新時のキャッシュクリア
   ========================================================= */
if ("serviceWorker" in navigator) {
    navigator.serviceWorker.ready
        .then(() => {
            const savedVersion = localStorage.getItem("app_version");
            if (typeof APP_VERSION !== "undefined" && savedVersion !== APP_VERSION) {
                localStorage.setItem("app_version", APP_VERSION);

                if ("caches" in window) {
                    caches.keys().then((names) => {
                        for (const name of names) {
                            caches.delete(name);
                        }
                    });
                }
            }
        })
        .catch((err) => {
            console.warn("serviceWorker.ready の取得に失敗:", err);
        });
}

/* =========================================================
   ■ グローバル変数
   ========================================================= */
let allResults = [];
let selectedTopic = 1;
let studentCount = 0;
let studentNames = [];

/* =========================================================
   ■ お題データ
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
        "後頭部、頭蓋骨の下からスタートできている",
        "指の腹を使い優しく横に揺らしてできている",
        "毛の生え際から中央に向かってマッサージする",
        "終わりの位置があっている",
        "横から前は生え際から中央に向かってマッサージする",
        "８分割全てをマッサージできている"
    ],
    2: [
        "人差し指で耳の付け根の上部からスタート（体が真っ直ぐになっている）",
        "耳の付け根を剥がすイメージで、耳の後ろの周りをくるくるとマッサージする",
        "耳の一番下のところに人差し指をあてて、頭頂に向かって持ち上げる",
        "人差し指で、耳のみぞ、最後に耳の穴を洗う感じでマッサージする",
        "親指と人差し指か、中指で、上、真ん中、下の3箇所を指先か手首を使って引く"
    ],
    3: [
        "手をあてる位置が合っている",
        "頬骨に親指が当たっている",
        "手のひらでピッタリと頬を包み込んでいる",
        "耳を人差し指・中指が挟んでいる",
        "薬指が後頭部についている",
        "回し方（上→外→下）があっている"
    ],
    4: [
        "口角から人差し指を頬の丸みに沿っていれている",
        "奥からジグザグジグザグできている",
        "頬の内側を奥から頬を膨らませるように指全体を使ってできている"
    ],
    5: [
        "耳の後ろの窪みからスタート",
        "している側の方に触れていられる",
        "耳の後ろから頭蓋骨の下側を形に沿って首の後ろまでできている",
        "首の後ろから顎の下まで",
        "顎の下で縦にタオルを使い、舌骨上筋群舌尖まで顎の内側をできる",
        "鎖骨の上を脇の下まで横に移動しながらできる",
        "脇の下までしっかりはいれる"
    ],
    6: [
        "片方の手を肋骨の下に手のひらに隙間なく",
        "もう一方の手を背、肋骨、骨盤の間に中指を入れて手のひらで隙間なく優しく包み込む",
        "ゆっくり呼吸に合わせて、手をお腹に沿わせておける"
    ],
    7: [
        "下の手（利き手ではない手）で手を支え、上の手（利き手）の親指を手のひらの中心に置く",
        "下の手で上の親指を手のひら全体でくるむように丸くしていく",
        "親指と人差し指の間から、小指側の手首に向かって親指で生命線をなぞるイメージで斜め下に３回マッサージを行う",
        "親指と中指か人差し指で、親指と小指の付け根の関節をくっつけるように、中心に向かってあわせる"
    ],
    8: [
        "歯ブラシの持ち方があっている",
        "親指と人差し指の間にブラシを優しく入れることができる",
        "まっすぐ、親指側、人差し指側とマッサージする、全ての指を同様にマッサージする",
        "爪のはえぎわを横にずらしながらマッサージする",
        "爪、皮膚の間、皮膚を横に流れるようにマッサージする",
        "足裏の指の根本から、指の付け根をくるくるマッサージする",
        "かかへ移り、くるくると歯ブラシを回すことができる",
        "かかとから親指と人差し指の間を歯ブラシで抜けてマッサージする"
    ],
    9: [
        "頭部、スタートの位置があっている",
        "背骨の脇から終了の位置があっている",
        "頭部からスタートし、肩甲骨の内側にタオルをいれるようにしてできる",
        "頭部からスタートして背骨に近いところから骨盤の上を通ってウエストにぬける"
    ],
    10: [
        "スタートの位置にいられる（頭から足先までを真っ直ぐに寝る）",
        "足の膝を持って、胸に近づけその後、足を直角にできる",
        "【足の前】左手でふくらはぎの後ろを包み込むように持つ。右手で膝をつつみ、足の中心の部分を膝からまっすぐ腹部に向かって、手をミトンのような形にしてマッサージする",
        "【足の内側】足を胸に近づけ、①お尻を包みあげるように足を右側（外側）に回すようにしながら倒し、右手で足を固定。②左手で膝をつつみ、内側の大腿部分を股関節に向かってマッサージする。③股関節に小指があたったら、さらに親指がひと回り奥へできる",
        "【足の後ろ側】①足は直角にし、左手でふくらはぎを持ち固定。②右手はちょうだいの手にして、膝の裏側からお尻に向かってマッサージする。③ヒップラインをつくれる。④掌が浮かないように体を使って行う",
        "【足の外側】①お尻を上げるようにし、逆の方に向かって膝がくるように固定。②右手で膝を包み込む。③その手で太ももの外側の部分を手のひらでマッサージする",
        "【お尻】太ももの横をマッサージしてきて、①お尻のくぼんだ部分に右手の母指球をあて、②体重を肩の方向にかけてマッサージできる",
        "足を右側（外側）に倒し、右手で足を固定する",
        "左手で膝をつつみ、内側の大腿部分を膝から陰部に向かってマッサージする",
        "小指が股関節にあたったら、親指をさらに深くマッサージできる",
        "左手で足を固定し、右手をちょうだいの手にして、大腿の裏側からお尻の部分を膝からお尻に向かってヒップアップをイメージしながらマッサージする",
        "一度足を中心に戻し、そのあとに左側（内側）に倒し、左手で足を固定する",
        "子どもの太ももの外側の部分を右手で膝の部分からお尻に向かってマッサージする",
        "お尻のくぼんだ部分を右手の母指球の部分を使って、ぐるぐると体重をのせながらマッサージする"
    ]
};

/* =========================================================
   ■ 保存・復元
   ========================================================= */
function saveAppState() {
    const state = {
        allResults,
        selectedTopic,
        studentCount,
        studentNames,
        currentScreen: document.querySelector(".screen.active")?.id || "startScreen"
    };
    localStorage.setItem("bhs_app_backup", JSON.stringify(state));
}

window.addEventListener("load", () => {
    const savedData = localStorage.getItem("bhs_app_backup");

    if (!savedData) {
        showScreen("startScreen");
        return;
    }

    try {
        const state = JSON.parse(savedData);

        allResults = state.allResults || [];
        selectedTopic = state.selectedTopic || 1;
        studentCount = state.studentCount || 0;
        studentNames = state.studentNames || [];

        const screenId = state.currentScreen || "startScreen";
        showScreen(screenId);

        if (screenId === "nameScreen") {
            renderNameInputs();
        } else if (screenId === "checkScreen") {
            generateCheckScreen();
        }
    } catch (e) {
        console.error("保存データの読み込みに失敗:", e);
        localStorage.removeItem("bhs_app_backup");
        showScreen("startScreen");
    }
});

/* =========================================================
   ■ 画面遷移
   ========================================================= */
function showScreen(id) {
    document.querySelectorAll(".screen").forEach((s) => s.classList.remove("active"));
    const target = document.getElementById(id);
    if (target) {
        target.classList.add("active");
        window.scrollTo(0, 0);
    }
}

function clearInputViews() {
    const countInput = document.getElementById("studentCount");
    if (countInput) countInput.value = "";

    const nameList = document.getElementById("nameList");
    if (nameList) nameList.innerHTML = "";

    const checkItems = document.getElementById("checkItems");
    if (checkItems) checkItems.innerHTML = "";
}

function goToTop() {
    localStorage.removeItem("bhs_app_backup");
    allResults = [];
    selectedTopic = 1;
    studentCount = 0;
    studentNames = [];
    clearInputViews();
    showScreen("startScreen");
}

function goToStart() {
    showScreen("topScreen");
    saveAppState();
}

function goToStartScreen() {
    goToStart();
}

function backToTop() {
    showScreen("topScreen");
    saveAppState();
}

function backToCount() {
    showScreen("countScreen");
    saveAppState();
}

function backToNameInput() {
    showScreen("nameScreen");
    saveAppState();
}

function backToTopic10() {
    selectedTopic = 10;
    generateCheckScreen();
    showScreen("checkScreen");
    saveAppState();
}

function backToPreviousTopic() {
    if (selectedTopic > 1) {
        selectedTopic--;
        generateCheckScreen();
        saveAppState();
    } else {
        showScreen("nameScreen");
        saveAppState();
    }
}

function selectTopic(num) {
    selectedTopic = Number(num);
    showScreen("countScreen");
    saveAppState();
}

/* =========================================================
   ■ 名前入力
   ========================================================= */
function renderNameInputs() {
    const nameList = document.getElementById("nameList");
    if (!nameList) return;

    nameList.innerHTML = "";

    for (let i = 1; i <= studentCount; i++) {
        const savedName = studentNames[i - 1] || "";
        nameList.innerHTML += `
            <div class="nameRow">
                ${i}：<input
                    type="text"
                    id="name${i}"
                    class="inputBox"
                    placeholder="名前"
                    value="${savedName}"
                    oninput="updateStudentNames()"
                >
            </div>
        `;
    }
}

function updateStudentNames() {
    studentNames = [];

    for (let i = 1; i <= studentCount; i++) {
        const input = document.getElementById(`name${i}`);
        const name = input && input.value.trim() ? input.value.trim() : `受験生${i}`;
        studentNames.push(name);
    }

    saveAppState();
}

function goToNameInput() {
    const countVal = document.getElementById("studentCount").value;
    studentCount = Number(countVal);

    if (!studentCount || studentCount < 1) {
        alert("人数を入力してください");
        return;
    }

    renderNameInputs();
    showScreen("nameScreen");
    saveAppState();
}

function goToCheck() {
    updateStudentNames();
    generateCheckScreen();
    showScreen("checkScreen");
    saveAppState();
}

/* =========================================================
   ■ チェック画面
   ========================================================= */
function generateCheckScreen() {
    const items = topics[selectedTopic];
    const topicName = topicNames[selectedTopic];
    const checkItems = document.getElementById("checkItems");

    if (!items || !checkItems) return;

    let html = `<h2 class="subtitle">【${selectedTopic}：${topicName}】</h2>`;

    items.forEach((item, itemIndex) => {
        html += `
            <div class="itemBlock">
                <div class="itemTitle">【${selectedTopic}${topicName}：項目${itemIndex + 1}】${item}</div>
                <div class="checksRow">
        `;

        studentNames.forEach((name, studentIndex) => {
            const saved = allResults.find(
                (r) => r.topic === selectedTopic && r.item === item && r.name === name
            );
            const isChecked = saved && saved.check === "○" ? "on" : "";

            html += `
                <div class="checkCell">
                    <span class="checkName">${name}</span>
                    <div
                        class="checkBox ${isChecked}"
                        id="chk_${itemIndex}_${studentIndex}"
                        onclick="toggleCheck('${itemIndex}_${studentIndex}'); saveCheck(${itemIndex}, ${studentIndex})"
                    ></div>
                </div>
            `;
        });

        html += `</div><div class="notesLabel">備考：</div><div class="notesRow">`;

        studentNames.forEach((name, studentIndex) => {
            const saved = allResults.find(
                (r) => r.topic === selectedTopic && r.item === item && r.name === name
            );
            const noteValue = saved ? saved.note : "";

            html += `
                <div class="noteCell">
                    ${name}：
                    <textarea
                        id="note_${itemIndex}_${studentIndex}"
                        class="noteArea"
                        oninput="saveCheck(${itemIndex}, ${studentIndex})"
                    >${noteValue}</textarea>
                </div>
            `;
        });

        html += `</div></div><hr>`;
    });

    checkItems.innerHTML = html;

    const backBtn = document.getElementById("checkBackBtn");
    const nextBtn = document.getElementById("checkNextBtn");

    if (backBtn) {
        backBtn.textContent = selectedTopic === 1 ? "戻る" : "前の項目へ";
    }

    if (nextBtn) {
        nextBtn.textContent = selectedTopic === 10 ? "完了" : "次の項目へ";
    }

    window.scrollTo(0, 0);
}

function toggleCheck(id) {
    const el = document.getElementById("chk_" + id);
    if (el) {
        el.classList.toggle("on");
    }
}

/* =========================================================
   ■ 保存・進行
   ========================================================= */
function saveCurrentTopicToMemory() {
    const items = topics[selectedTopic];
    if (!items) return;

    studentNames.forEach((name, studentIndex) => {
        items.forEach((item, itemIndex) => {
            const checkBtn = document.getElementById(`chk_${itemIndex}_${studentIndex}`);
            const noteEl = document.getElementById(`note_${itemIndex}_${studentIndex}`);
            if (!checkBtn || !noteEl) return;

            const checked = checkBtn.classList.contains("on") ? "○" : "";
            const note = noteEl.value;

            const existing = allResults.find(
                (r) => r.topic === selectedTopic && r.item === item && r.name === name
            );

            if (existing) {
                existing.check = checked;
                existing.note = note;
            } else {
                allResults.push({
                    topic: selectedTopic,
                    item,
                    name,
                    check: checked,
                    note
                });
            }
        });
    });
}

function saveCheck(itemIndex, studentIndex) {
    const item = topics[selectedTopic]?.[itemIndex];
    const name = studentNames[studentIndex];
    const checkBtn = document.getElementById(`chk_${itemIndex}_${studentIndex}`);
    const noteEl = document.getElementById(`note_${itemIndex}_${studentIndex}`);

    if (!item || !name || !checkBtn || !noteEl) return;

    const checked = checkBtn.classList.contains("on") ? "○" : "";
    const note = noteEl.value;

    const existing = allResults.find(
        (r) => r.topic === selectedTopic && r.item === item && r.name === name
    );

    if (existing) {
        existing.check = checked;
        existing.note = note;
    } else {
        allResults.push({
            topic: selectedTopic,
            item,
            name,
            check: checked,
            note
        });
    }

    saveAppState();
}

function saveAndNext() {
    saveCurrentTopicToMemory();

    if (selectedTopic < 10) {
        selectedTopic++;
        generateCheckScreen();
        saveAppState();
    } else {
        showScreen("finishScreen");
        saveAppState();
    }
}

/* =========================================================
   ■ Excel保存
   ========================================================= */
function saveAllExcel() {
    const wb = XLSX.utils.book_new();

    studentNames.forEach((name) => {
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
                const row = allResults.find(
                    (r) => r.topic === topic && r.item === item && r.name === name
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

        ws["!cols"] = [
            { wch: 23 },
            { wch: 90 },
            { wch: 10 },
            { wch: 90 }
        ];

        const range = XLSX.utils.decode_range(ws["!ref"]);

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

        ws["!merges"] = mergeRanges;

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

        XLSX.utils.book_append_sheet(wb, ws, name);
    });

    const today = new Date();
    const fileName =
        `10BHS_${today.getFullYear()}` +
        `${String(today.getMonth() + 1).padStart(2, "0")}` +
        `${String(today.getDate()).padStart(2, "0")}.xlsx`;

    XLSX.writeFile(wb, fileName);
}}

window.addEventListener("load", () => {
    const savedData = localStorage.getItem("bhs_app_backup");
    if (savedData) {
        try {
            const state = JSON.parse(savedData);
            allResults = state.allResults || [];
            selectedTopic = state.selectedTopic || 1;
            studentCount = state.studentCount || 0;
            studentNames = state.studentNames || [];

            if (state.currentScreen) {
                showScreen(state.currentScreen);
                if (state.currentScreen === "nameScreen") {
                    renderNameInputs();
                } else if (state.currentScreen === "checkScreen") {
                    generateCheckScreen();
                }
            }
        } catch (e) {
            console.error("保存データの読み込みに失敗しました:", e);
            localStorage.removeItem("bhs_app_backup");
        }
    }
});

/* =========================================================
   ■ 画面遷移
   ========================================================= */

function goToTop() {
    // タイトル（初期状態）へ戻る際にデータをクリア
    localStorage.removeItem("bhs_app_backup");
    allResults = [];
    selectedTopic = 1;
    studentCount = 0;
    studentNames = [];

    const countInput = document.getElementById("studentCount");
    if (countInput) countInput.value = "";

    const nameList = document.getElementById("nameList");
    if (nameList) nameList.innerHTML = "";

    const checkItems = document.getElementById("checkItems");
    if (checkItems) checkItems.innerHTML = "";

    showScreen("topScreen");
}

// はじめるボタン用
function goToStart() {
    showScreen("startScreen");
    saveAppState();
}

// 既存名でも動くようにしておく
function goToStartScreen() {
    goToStart();
}

function selectTopic(num) {
    selectedTopic = num;
    showScreen("countScreen");
    saveAppState();
}

function renderNameInputs() {
    const nameList = document.getElementById("nameList");
    if (!nameList) return;

    nameList.innerHTML = "";
    for (let i = 1; i <= studentCount; i++) {
        const savedName = studentNames[i - 1] || "";
        nameList.innerHTML += `
            <div class="nameRow">
                ${i}：<input type="text" id="name${i}" class="inputBox" placeholder="名前"
                       value="${savedName}" oninput="updateStudentNames()">
            </div>
        `;
    }
}

function updateStudentNames() {
    studentNames = [];
    for (let i = 1; i <= studentCount; i++) {
        const input = document.getElementById(`name${i}`);
        const name = input?.value || `受験生${i}`;
        studentNames.push(name);
    }
    saveAppState();
}

function goToNameInput() {
    const countVal = document.getElementById("studentCount").value;
    studentCount = Number(countVal);

    if (studentCount < 1) {
        alert("人数を入力してください");
        return;
    }

    renderNameInputs();
    showScreen("nameScreen");
    saveAppState();
}

function goToCheck() {
    updateStudentNames();
    showScreen("checkScreen");
    generateCheckScreen();
    saveAppState();
}

/* =========================================================
   ■ 戻るボタン
   ========================================================= */
function backToTop() {
    showScreen("topScreen");
    saveAppState();
}

function backToCount() {
    showScreen("countScreen");
    saveAppState();
}

function backToNameInput() {
    showScreen("nameScreen");
    saveAppState();
}

// 最終確認画面からお題10へ戻る
function backToTopic10() {
    selectedTopic = 10;
    generateCheckScreen();
    showScreen("checkScreen");
    saveAppState();
}

function backToPreviousTopic() {
    if (selectedTopic > 1) {
        selectedTopic--;
        generateCheckScreen();
        saveAppState();
    } else {
        showScreen("nameScreen");
        saveAppState();
    }
}

/* =========================================================
   ■ 画面切り替え共通処理
   ========================================================= */
function showScreen(id) {
    document.querySelectorAll(".screen").forEach(s => s.classList.remove("active"));
    const target = document.getElementById(id);
    if (target) {
        target.classList.add("active");
        window.scrollTo(0, 0);
    }
}

/* =========================================================
   ■ お題データ
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
        "後頭部、頭蓋骨の下からスタートできている",
        "指の腹を使い優しく横に揺らしてできている",
        "毛の生え際から中央に向かってマッサージする",
        "終わりの位置があっている",
        "横から前は生え際から中央に向かってマッサージする",
        "８分割全てをマッサージできている"
    ],
    2: [
        "人差し指で耳の付け根の上部からスタート（体が真っ直ぐになっている）",
        "耳の付け根を剥がすイメージで、耳の後ろの周りをくるくるとマッサージする",
        "耳の一番下のところに人差し指をあてて、頭頂に向かって持ち上げる",
        "人差し指で、耳のみぞ、最後に耳の穴を洗う感じでマッサージする",
        "親指と人差し指か、中指で、上、真ん中、下の3箇所を指先か手首を使って引く"
    ],
    3: [
        "手をあてる位置が合っている",
        "頬骨に親指が当たっている",
        "手のひらでピッタリと頬を包み込んでいる",
        "耳を人差し指・中指が挟んでいる",
        "薬指が後頭部についている",
        "回し方（上→外→下）があっている"
    ],
    4: [
        "口角から人差し指を頬の丸みに沿っていれている",
        "奥からジグザグジグザグできている",
        "頬の内側を奥から頬を膨らませるように指全体を使ってできている"
    ],
    5: [
        "耳の後ろの窪みからスタート",
        "している側の方に触れていられる",
        "耳の後ろから頭蓋骨の下側を形に沿って首の後ろまでできている",
        "首の後ろから顎の下まで",
        "顎の下で縦にタオルを使い、舌骨上筋群舌尖まで顎の内側をできる",
        "鎖骨の上を脇の下まで横に移動しながらできる",
        "脇の下までしっかりはいれる"
    ],
    6: [
        "片方の手を肋骨の下に手のひらに隙間なく",
        "もう一方の手を背、肋骨、骨盤の間に中指を入れて手のひらで隙間なく優しく包み込む",
        "ゆっくり呼吸に合わせて、手をお腹に沿わせておける"
    ],
    7: [
        "下の手（利き手ではない手）で手を支え、上の手（利き手）の親指を手のひらの中心に置く",
        "下の手で上の親指を手のひら全体でくるむように丸くしていく",
        "親指と人差し指の間から、小指側の手首に向かって親指で生命線をなぞるイメージで斜め下に３回マッサージを行う",
        "親指と中指か人差し指で、親指と小指の付け根の関節をくっつけるように、中心に向かってあわせる"
    ],
    8: [
        "歯ブラシの持ち方があっている",
        "親指と人差し指の間にブラシを優しく入れることができる",
        "まっすぐ、親指側、人差し指側とマッサージする、全ての指を同様にマッサージする",
        "爪のはえぎわを横にずらしながらマッサージする",
        "爪、皮膚の間、皮膚を横に流れるようにマッサージする",
        "足裏の指の根本から、指の付け根をくるくるマッサージする",
        "かかへ移り、くるくると歯ブラシを回すことができる",
        "かかとから親指と人差し指の間を歯ブラシで抜けてマッサージする"
    ],
    9: [
        "頭部、スタートの位置があっている",
        "背骨の脇から終了の位置があっている",
        "頭部からスタートし、肩甲骨の内側にタオルをいれるようにしてできる",
        "頭部からスタートして背骨に近いところから骨盤の上を通ってウエストにぬける"
    ],
    10: [
        "スタートの位置にいられる（頭から足先までを真っ直ぐに寝る）",
        "足の膝を持って、胸に近づけその後、足を直角にできる",
        "【足の前】左手でふくらはぎの後ろを包み込むように持つ。右手で膝をつつみ、足の中心の部分を膝からまっすぐ腹部に向かって、手をミトンのような形にしてマッサージする",
        "【足の内側】足を胸に近づけ、①お尻を包みあげるように足を右側（外側）に回すようにしながら倒し、右手で足を固定。②左手で膝をつつみ、内側の大腿部分を股関節に向かってマッサージする。③股関節に小指があたったら、さらに親指がひと回り奥へできる",
        "【足の後ろ側】①足は直角にし、左手でふくらはぎを持ち固定。②右手はちょうだいの手にして、膝の裏側からお尻に向かってマッサージする。③ヒップラインをつくれる。④掌が浮かないように体を使って行う",
        "【足の外側】①お尻を上げるようにし、逆の方に向かって膝がくるように固定。②右手で膝を包み込む。③その手で太ももの外側の部分を手のひらでマッサージする",
        "【お尻】太ももの横をマッサージしてきて、①お尻のくぼんだ部分に右手の母指球をあて、②体重を肩の方向にかけてマッサージできる",
        "足を右側（外側）に倒し、右手で足を固定する",
        "左手で膝をつつみ、内側の大腿部分を膝から陰部に向かってマッサージする",
        "小指が股関節にあたったら、親指をさらに深くマッサージできる",
        "左手で足を固定し、右手をちょうだいの手にして、大腿の裏側からお尻の部分を膝からお尻に向かってヒップアップをイメージしながらマッサージする",
        "一度足を中心に戻し、そのあとに左側（内側）に倒し、左手で足を固定する",
        "子どもの太ももの外側の部分を右手で膝の部分からお尻に向かってマッサージする",
        "お尻のくぼんだ部分を右手の母指球の部分を使って、ぐるぐると体重をのせながらマッサージする"
    ]
};

/* =========================================================
   ■ チェック画面の生成
   ========================================================= */
function generateCheckScreen() {
    const items = topics[selectedTopic];
    const topicName = topicNames[selectedTopic];

    let html = `<h2 class="subtitle">【${selectedTopic}：${topicName}】</h2>`;

    items.forEach((item, itemIndex) => {
        html += `
            <div class="itemBlock">
                <div class="itemTitle">【${selectedTopic}${topicName}：項目${itemIndex + 1}】${item}</div>
                <div class="checksRow">
        `;

        studentNames.forEach((name, studentIndex) => {
            const saved = allResults.find(r => r.topic === selectedTopic && r.item === item && r.name === name);
            const isChecked = saved && saved.check === "○" ? "on" : "";

            html += `
                <div class="checkCell">
                    <span class="checkName">${name}</span>
                    <div class="checkBox ${isChecked}" id="chk_${itemIndex}_${studentIndex}"
                         onclick="toggleCheck('${itemIndex}_${studentIndex}'); saveCheck('${itemIndex}', '${studentIndex}')"></div>
                </div>
            `;
        });

        html += `</div><div class="notesLabel">備考：</div><div class="notesRow">`;

        studentNames.forEach((name, studentIndex) => {
            const saved = allResults.find(r => r.topic === selectedTopic && r.item === item && r.name === name);
            const noteValue = saved ? saved.note : "";

            html += `
                <div class="noteCell">${name}：
                    <textarea id="note_${itemIndex}_${studentIndex}" class="noteArea"
                              oninput="saveCheck('${itemIndex}', '${studentIndex}')">${noteValue}</textarea>
                </div>
            `;
        });

        html += `</div></div><hr>`;
    });

    const checkItems = document.getElementById("checkItems");
    if (checkItems) {
        checkItems.innerHTML = html;
    }

    window.scrollTo(0, 0);

    const backBtn = document.getElementById("checkBackBtn");
    const nextBtn = document.getElementById("checkNextBtn");
    if (backBtn) backBtn.textContent = (selectedTopic === 1) ? "戻る" : "前の項目へ";
    if (nextBtn) nextBtn.textContent = (selectedTopic === 10) ? "完了" : "次の項目へ";
}

function toggleCheck(id) {
    const el = document.getElementById("chk_" + id);
    if (el) {
        el.classList.toggle("on");
    }
}

/* =========================================================
   ■ 保存・進行ロジック
   ========================================================= */
function saveAndNext() {
    saveCurrentTopicToMemory();

    if (selectedTopic < 10) {
        selectedTopic++;
        generateCheckScreen();
        saveAppState();
    } else {
        showScreen("finishScreen");
        saveAppState();
    }
}

function saveCurrentTopicToMemory() {
    const items = topics[selectedTopic];

    studentNames.forEach((name, studentIndex) => {
        items.forEach((item, itemIndex) => {
            const checkBtn = document.getElementById(`chk_${itemIndex}_${studentIndex}`);
            const noteEl = document.getElementById(`note_${itemIndex}_${studentIndex}`);
            if (!checkBtn || !noteEl) return;

            const checked = checkBtn.classList.contains("on") ? "○" : "";
            const note = noteEl.value;

            let existing = allResults.find(r => r.topic === selectedTopic && r.item === item && r.name === name);
            if (existing) {
                existing.check = checked;
                existing.note = note;
            } else {
                allResults.push({ topic: selectedTopic, item, name, check: checked, note });
            }
        });
    });
}

function saveCheck(itemIndex, studentIndex) {
    const item = topics[selectedTopic][itemIndex];
    const name = studentNames[studentIndex];
    const checkBtn = document.getElementById(`chk_${itemIndex}_${studentIndex}`);
    const noteEl = document.getElementById(`note_${itemIndex}_${studentIndex}`);

    if (!checkBtn || !noteEl) return;

    const checked = checkBtn.classList.contains("on") ? "○" : "";
    const note = noteEl.value;

    let existing = allResults.find(r => r.topic === selectedTopic && r.item === item && r.name === name);
    if (existing) {
        existing.check = checked;
        existing.note = note;
    } else {
        allResults.push({ topic: selectedTopic, item, name, check: checked, note });
    }

    saveAppState();
}

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
                const row = allResults.find(r => r.topic === topic && r.item === item && r.name === name);
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
        ws["!cols"] = [
            { wch: 23 },
            { wch: 90 },
            { wch: 10 },
            { wch: 90 }
        ];

        const range = XLSX.utils.decode_range(ws["!ref"]);
        for (let R = 0; R <= range.e.r; R++) {
            for (let C = 0; C <= range.e.c; C++) {
                const cellAddress = XLSX.utils.encode_cell({ r: R, c: C });
                if (!ws[cellAddress]) continue;
                ws[cellAddress].s = {
                    alignment: { wrapText: true, vertical: "top" }
                };
            }
        }

        ws["!merges"] = mergeRanges;

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

        XLSX.utils.book_append_sheet(wb, ws, name);
    });

    const today = new Date();
    const fileName = `10BHS_${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, "0")}${String(today.getDate()).padStart(2, "0")}.xlsx`;
    XLSX.writeFile(wb, fileName);
}window.addEventListener("load", () => {
    const savedData = localStorage.getItem("bhs_app_backup");
    if (savedData) {
        const state = JSON.parse(savedData);
        allResults = state.allResults || [];
        selectedTopic = state.selectedTopic || 1;
        studentCount = state.studentCount || 0;
        studentNames = state.studentNames || [];

        if (state.currentScreen) {
            showScreen(state.currentScreen);
            if (state.currentScreen === "nameScreen") {
                renderNameInputs();
            } else if (state.currentScreen === "checkScreen") {
                generateCheckScreen();
            }
        }
    }
});

/* =========================================================
   ■ 画面遷移
   ========================================================= */

function goToTop() {
    // タイトル（初期状態）へ戻る際にデータをクリア
    localStorage.removeItem("bhs_app_backup");
    allResults = [];
    selectedTopic = 1;
    studentCount = 0;
    studentNames = [];

    const countInput = document.getElementById("studentCount");
    if (countInput) countInput.value = "";
    const nameList = document.getElementById("nameList");
    if (nameList) nameList.innerHTML = "";
    const checkItems = document.getElementById("checkItems");
    if (checkItems) checkItems.innerHTML = "";

    showScreen("topScreen");
}

function goToStartScreen() {
    showScreen("startScreen");
    saveAppState();
}

function selectTopic(num) {
    selectedTopic = num;
    showScreen("countScreen");
    saveAppState();
}

function renderNameInputs() {
    const nameList = document.getElementById("nameList");
    nameList.innerHTML = "";
    for (let i = 1; i <= studentCount; i++) {
        const savedName = studentNames[i - 1] || "";
        nameList.innerHTML += `
            <div class="nameRow">
                ${i}：<input type="text" id="name${i}" class="inputBox" placeholder="名前" 
                       value="${savedName}" oninput="updateStudentNames()">
            </div>
        `;
    }
}

function updateStudentNames() {
    studentNames = [];
    for (let i = 1; i <= studentCount; i++) {
        const name = document.getElementById(`name${i}`).value || `受験生${i}`;
        studentNames.push(name);
    }
    saveAppState();
}

function goToNameInput() {
    const countVal = document.getElementById("studentCount").value;
    studentCount = Number(countVal);
    if (studentCount < 1) {
        alert("人数を入力してください");
        return;
    }
    renderNameInputs();
    showScreen("nameScreen");
    saveAppState();
}

function goToCheck() {
    updateStudentNames();
    showScreen("checkScreen");
    generateCheckScreen();
    saveAppState();
}
/* =========================================================
   ■ 戻るボタン（追加・修正）
   ========================================================= */
function backToTop() { showScreen("topScreen"); saveAppState(); }
function backToCount() { showScreen("countScreen"); saveAppState(); }
function backToNameInput() { showScreen("nameScreen"); saveAppState(); }

// 【新設】最終確認画面からお題10へ戻るための関数
function backToTopic10() {
    selectedTopic = 10;          // お題番号を10に設定
    generateCheckScreen();      // お題10の画面を生成
    showScreen("checkScreen");   // チェック画面を表示
    saveAppState();             // 状態を保存
}

function backToPreviousTopic() {
    if (selectedTopic > 1) {
        selectedTopic--;
        generateCheckScreen();
        saveAppState();
    } else {
        showScreen("nameScreen");
        saveAppState();
    }
}

/* =========================================================
   ■ 画面切り替え共通処理
   ========================================================= */
function showScreen(id) {
    document.querySelectorAll(".screen").forEach(s => s.classList.remove("active"));
    const target = document.getElementById(id);
    if (target) {
        target.classList.add("active");
        window.scrollTo(0, 0); // 画面遷移時に一番上へスクロール
    }
}

/* =========================================================
   ■ お題データ
   ========================================================= */
const topicNames = {
    1: "頭皮", 2: "耳（日本手ぬぐい）", 3: "顔", 4: "口の中", 5: "からだのまえ",
    6: "おなかをゆるめる", 7: "てのひら", 8: "足ゆびと足うら", 9: "からだのうしろ", 10: "ふともものまわりとおしり"
};

const topics = {
    1: ["後頭部、頭蓋骨の下からスタートできている", "指の腹を使い優しく横に揺らしてできている", "毛の生え際から中央に向かってマッサージする", "終わりの位置があっている", "横から前は生え際から中央に向かってマッサージする","８分割全てをマッサージできている"],
    2: ["人差し指で耳の付け根の上部からスタート（体が真っ直ぐになっている）", "耳の付け根を剥がすイメージで、耳の後ろの周りをくるくるとマッサージする", "耳の一番下のところに人差し指をあてて、頭頂に向かって持ち上げる", "人差し指で、耳のみぞ、最後に耳の穴を洗う感じでマッサージする", "親指と人差し指か、中指で、上、真ん中、下の3箇所を指先か手首を使って引く"],
    3: ["手をあてる位置が合っている", "頬骨に親指が当たっている", "手のひらでピッタリと頬を包み込んでいる", "耳を人差し指・中指が挟んでいる", "薬指が後頭部についている", "回し方（上→外→下）があっている"],
    4: ["口角から人差し指を頬の丸みに沿っていれている", "奥からジグザグジグザグできている", "頬の内側を奥から頬を膨らませるように指全体を使ってできている"],
    5: ["耳の後ろの窪みからスタート", "している側の方に触れていられる", "耳の後ろから頭蓋骨の下側を形に沿って首の後ろまでできている", "首の後ろから顎の下まで", "顎の下で縦にタオルを使い、舌骨上筋群舌尖まで顎の内側をできる", "鎖骨の上を脇の下まで横に移動しながらできる","脇の下までしっかりはいれる"],
    6: [ "片方の手を肋骨の下に手のひらに隙間なく", "もう一方の手を背、肋骨、骨盤の間に中指を入れて手のひらで隙間なく優しく包み込む", "ゆっくり呼吸に合わせて、手をお腹に沿わせておける"],
    7: ["下の手（利き手ではない手）で手を支え、上の手（利き手）の親指を手のひらの中心に置く",  "下の手で上の親指を手のひら全体でくるむように丸くしていく", "親指と人差し指の間から、小指側の手首に向かって親指で生命線をなぞるイメージで斜め下に３回マッサージを行う", "親指と中指か人差し指で、親指と小指の付け根の関節をくっつけるように、中心に向かってあわせる"],
    8: ["歯ブラシの持ち方があっている", "親指と人差し指の間にブラシを優しく入れることができる", "まっすぐ、親指側、人差し指側とマッサージする、全ての指を同様にマッサージする",  "爪のはえぎわを横にずらしながらマッサージする", "爪、皮膚の間、皮膚を横に流れるようにマッサージする", "足裏の指の根本から、指の付け根をくるくるマッサージする", "かかへ移り、くるくると歯ブラシを回すことができる", "かかとから親指と人差し指の間を歯ブラシで抜けてマッサージする"],
    9: ["頭部、スタートの位置があっている", "背骨の脇から終了の位置があっている", "頭部からスタートし、肩甲骨の内側にタオルをいれるようにしてできる",  "頭部からスタートして背骨に近いところから骨盤の上を通ってウエストにぬける"],
    10: ["スタートの位置にいられる（頭から足先までを真っ直ぐに寝る）", "足の膝を持って、胸に近づけその後、足を直角にできる",,"【足の前】左手でふくらはぎの後ろを包み込むように持つ。右手で膝をつつみ足の中心の部分を膝からまっすぐ腹部に向かって、手をミトンのような形にしてマッサージする" ,"【足の内側】足を胸に近づけ、①お尻を包みあげるように足を右側（外側）に回すようにしながら倒し、右手で足を固定。②左手で、膝をつつみ、内側の大腿部分を股関節に向かって、マッサージする。③股関節に小指があたったら、さらに親指がひと摩りおくへできる","【足の後ろ側】①足は直角にし、左手でふくらはぎを持ち固定。②右手はちょうだいの手にして、膝の裏側からお尻に向かってマッサージする③ヒップラインをつくれる④掌が浮かないように体を使って行う","【足の外側】①お尻を上げるようにし、逆の方に向かって膝がくるように固定。②右手で膝を包み込む③その手で太ももの外側の部分を手のひらでマッサージする","【お尻】太ももの横をマッサージしてきて、①お尻のくぼんだ部分に右手の母指球をあて②体重を肩の方向にかけてマッサージできる""足を右側（外側）に倒し、右手で足を固定する", "左手で膝をつつみ、内側の大腿部分を膝から陰部に向かって、マッサージする", "小指が股関節にあたったら、親指をさらに深くマッサージできる", "左手で足を右手をちょうだいの手にして、大腿の裏側からお尻の部分を膝からお尻に向かってヒップアップをイメージしながらマッサージする", "一度足を中心に戻し、そのあとに左側（中側）に倒し、左手で足を固定する", "子供の太ももの外側の部分を右手で膝の部分からお尻に向かってマッサージする", "お尻のくぼんだ部分を右手の母指球の部分を使って、ぐるぐると体重をのせながら"]
};

/* =========================================================
   ■ チェック画面の生成
   ========================================================= */
function generateCheckScreen() {
    const items = topics[selectedTopic];
    const topicName = topicNames[selectedTopic];
    // ★ 見出しに番号を追加
    let html = `<h2 class="subtitle">【${selectedTopic}：${topicName}】</h2>`;

    items.forEach((item, itemIndex) => {
        html += `<div class="itemBlock">
            <div class="itemTitle">【${selectedTopic}${topicName} ：項目${itemIndex + 1}】${item}</div>
            <div class="checksRow">`;

        studentNames.forEach((name, studentIndex) => {
            const saved = allResults.find(r => r.topic === selectedTopic && r.item === item && r.name === name);
            const isChecked = saved && saved.check === "○" ? "on" : "";
            html += `<div class="checkCell">
                    <span class="checkName">${name}</span>
                    <div class="checkBox ${isChecked}" id="chk_${itemIndex}_${studentIndex}"
                         onclick="toggleCheck('${itemIndex}_${studentIndex}'); saveCheck('${itemIndex}', '${studentIndex}')"></div>
                </div>`;
        });

        html += `</div><div class="notesLabel">備考：</div><div class="notesRow">`;

        studentNames.forEach((name, studentIndex) => {
            const saved = allResults.find(r => r.topic === selectedTopic && r.item === item && r.name === name);
            const noteValue = saved ? saved.note : "";
            html += `<div class="noteCell">${name}：
                    <textarea id="note_${itemIndex}_${studentIndex}" class="noteArea"
                              oninput="saveCheck('${itemIndex}', '${studentIndex}')">${noteValue}</textarea>
                </div>`;
        });
        html += `</div></div><hr>`;
    });

    document.getElementById("checkItems").innerHTML = html;
    window.scrollTo(0, 0); // お題切り替え時（次へ/戻る）も一番上へスクロール

    const backBtn = document.getElementById("checkBackBtn");
    const nextBtn = document.getElementById("checkNextBtn");
    if (backBtn) backBtn.textContent = (selectedTopic === 1) ? "戻る" : "前の項目へ";
    if (nextBtn) nextBtn.textContent = (selectedTopic === 10) ? "完了" : "次の項目へ";
}

function toggleCheck(id) {
    const el = document.getElementById("chk_" + id);
    el.classList.toggle("on");
}

/* =========================================================
   ■ 保存・進行ロジック
   ========================================================= */
function saveAndNext() {
    saveCurrentTopicToMemory();
    if (selectedTopic < 10) {
        selectedTopic++;
        generateCheckScreen();
        saveAppState();
    } else {
        showScreen("finishScreen");
        saveAppState(); 
    }
}

function saveCurrentTopicToMemory() {
    const items = topics[selectedTopic];
    studentNames.forEach((name, studentIndex) => {
        items.forEach((item, itemIndex) => {
            const checkBtn = document.getElementById(`chk_${itemIndex}_${studentIndex}`);
            if (!checkBtn) return;
            const checked = checkBtn.classList.contains("on") ? "○" : "";
            const note = document.getElementById(`note_${itemIndex}_${studentIndex}`).value;

            let existing = allResults.find(r => r.topic === selectedTopic && r.item === item && r.name === name);
            if (existing) {
                existing.check = checked;
                existing.note = note;
            } else {
                allResults.push({ topic: selectedTopic, item, name, check: checked, note });
            }
        });
    });
}

function saveCheck(itemIndex, studentIndex) {
    const item = topics[selectedTopic][itemIndex];
    const name = studentNames[studentIndex];
    const checkBtn = document.getElementById(`chk_${itemIndex}_${studentIndex}`);
    if(!checkBtn) return;
    const checked = checkBtn.classList.contains("on") ? "○" : "";
    const note = document.getElementById(`note_${itemIndex}_${studentIndex}`).value;

    let existing = allResults.find(r => r.topic === selectedTopic && r.item === item && r.name === name);
    if (existing) {
        existing.check = checked;
        existing.note = note;
    } else {
        allResults.push({ topic: selectedTopic, item, name, check: checked, note });
    }
    saveAppState();
}

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
            mergeRanges.push({ s: { r: currentRow, c: 0 }, e: { r: currentRow + itemCount - 1, c: 0 } });
            items.forEach((item, itemIndex) => {
                const row = allResults.find(r => r.topic === topic && r.item === item && r.name === name);
                sheetData.push([itemIndex === 0 ? topicName : "", item, row ? row.check : "", row ? row.note : ""]);
                currentRow++;
            });
        }

        const ws = XLSX.utils.aoa_to_sheet(sheetData);
        ws['!cols'] = [{ wch: 23 }, { wch: 90 }, { wch: 10 }, { wch: 90 }];
        const range = XLSX.utils.decode_range(ws['!ref']);
        for (let R = 0; R <= range.e.r; R++) {
            for (let C = 0; C <= range.e.c; C++) {
                const cellAddress = XLSX.utils.encode_cell({ r: R, c: C });
                if (!ws[cellAddress]) continue;
                ws[cellAddress].s = { alignment: { wrapText: true, vertical: "top" } };
            }
        }
        ws['!merges'] = mergeRanges;
        for (let i = 1; i < sheetData.length; i++) {
            const cellAddress = XLSX.utils.encode_cell({ r: i, c: 0 });
            if (ws[cellAddress]) {
                ws[cellAddress].s = { alignment: { horizontal: "center", vertical: "center", wrapText: true } };
            }
        }
        XLSX.utils.book_append_sheet(wb, ws, name);
    });

    const today = new Date();
    const fileName = `10BHS_${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, "0")}${String(today.getDate()).padStart(2, "0")}.xlsx`;
    XLSX.writeFile(wb, fileName);
}
