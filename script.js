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
let allResults = [];
let selectedCategory = 1;
let selectedTopic = 1;
let studentCount = 0;
let studentNames = [];

const categoryNames = {
    1: "BHS基礎",
    2: "BHS歌",
    3: "BHS食と育ち",
    4: "BHS総合"
};

/* =========================================================
   ■ データの保存・復元ロジック
   ========================================================= */

function saveAppState() {
    const state = {
        allResults,
        selectedCategory,
        selectedTopic,
        studentCount,
        studentNames,
        currentScreen: document.querySelector(".screen.active")?.id || "topScreen"
    };
    localStorage.setItem("bhs_app_backup", JSON.stringify(state));
}

window.addEventListener("load", () => {
    const savedData = localStorage.getItem("bhs_app_backup");
    if (savedData) {
        const state = JSON.parse(savedData);
        allResults = state.allResults || [];
        selectedCategory = state.selectedCategory || 1;
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
    localStorage.removeItem("bhs_app_backup");
    allResults = [];
    selectedCategory = 1;
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

function selectCategory(num) {
    selectedCategory = num;
    selectedTopic = 1;
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
   ■ 戻るボタン
   ========================================================= */
function backToTop() { showScreen("topScreen"); saveAppState(); }
function backToCount() { showScreen("countScreen"); saveAppState(); }
function backToNameInput() { showScreen("nameScreen"); saveAppState(); }

function backToLastTopic() {
    const topicCount = getCategoryTopicCount(selectedCategory);
    selectedTopic = topicCount;
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
   ■ お題名（カテゴリ別）
   ========================================================= */
const categoryTopicNames = {
    1: {
        1: "頭皮", 2: "耳（日本手ぬぐい）", 3: "顔", 4: "口の中", 5: "からだのまえ",
        6: "おなかをゆるめる", 7: "てのひら", 8: "足ゆびと足うら", 9: "からだのうしろ", 10: "ふともものまわりとおしり"
    },
    2: {
        1: "歌1（今後アップデート予定）"
    },
    3: {
        1: "食と育ち1（今後アップデート予定）"
    },
    4: {
        1: "総合1（今後アップデート予定）"
    }
};

function getCategoryTopicCount(category) {
    return Object.keys(categoryTopicNames[category]).length;
}

function getTopicName(category, topic) {
    return categoryTopicNames[category][topic] || `お題${topic}`;
}

/* =========================================================
   ■ チェック項目データ
   ========================================================= */
const categoryItems = {
    1: {
        1: ["スタートの位置があっている(頭蓋骨の下側の位置)", "指の腹で柔らかく毛の生え際から中央に向かってマッサージする", "横から前は髪の生え際から中央に向かってマッサージする", "8分割全てをマッサージ出来ている", "終わりの位置があっている"],
        2: ["スタートの位置があっている(人差し指で耳の付け根)", "耳の付け根を剥がすイメージで、耳の後ろの周りをくるくるとマッサージする", "耳の一番下のところに人差し指をあてて、頭頂にむかって持ち上げる(頭がまっすぐになっている)", "人差し指で、耳のみぞを最後に耳の穴を洗う感じでマッサージする", "親指と中指で、上、真ん中、下の3方向に引っ張る", "終わりの位置があっている"],
        3: ["手をあてる位置が合っている", "頬骨に親指が当たっている", "手のひらが頬を包み込んでいる", "耳を人差し指・中指が挟んでいる", "薬指が後頭部についている", "回し方（上→外→下）があっている"],
        4: ["口角から指をいれている", "頬の内側を奥から頬を膨らませるようにできている", "奥からジグザクジグザグできている"],
        5: ["スタートの位置があっている", "耳の後ろから頭蓋骨の下側に沿って首の後ろまで", "首の後ろから顎の下まで", "下顎の内側を顎の中央までさする", "鎖骨の上を横にタオルを振りながら", "肩の前側から脇の下をしっかりはいれる"],
        6: ["手をあてる位置があっている", "片方の手を肋骨の下に手のひら全体で優しく当てることが出来る", "もう一方の手を背、肋骨、骨盤の間に中指を入れて手のひらで優しく包み込む", "ゆっくり呼吸に合わせて、手をお腹に沿わせておける"],
        7: ["下の手（利き手ではない手）で丸く手のひらを支えることができる", "子供の手の中心に、（自分の利き手の）親指をあてることができる", "上の手で手のひらを、下の手で子供の手のひら全体でくるむように丸くできる", "親指と人差し指の間から、小指側の手首に向かって親指で生命線をなぞるイメージで斜め下に３回マッサージを行う", "利き手の親指と中指か人差し指で、子供の親指と小指の付け根の関節をくっつけるように、あわせる"],
        8: ["鉛筆を持つように歯ブラシをもてる", "親指と人差し指の間にブラシを優しく入れることができる", "指の股をUの字状に①まっすぐ②親指側③人差し指とマッサージする", "全ての指を同様にマッサージできる", "爪のはえぎわを横にずらしながらマッサージできる", "指先の柔らかいところを横に流れるようにマッサージする", "指の付け根から、付け根の下、土踏まずより上（足裏の親指のポッコリしているところ）を大きく、くるくるマッサージできる", "かかと全体を、くるくると歯ブラシを回すことができる", "かかとから親指と人差し指の間に抜けてマッサージする"],
        9: ["すべてスタートがあっている", "スタートの位置から、背骨の脇を縦にタオルでさする", "背骨の脇から、終了の位置があっている", "肩甲骨のうちにはいっている", "脇までの位置、終了の位置があっている", "背骨に近いところから骨盤の上を通ってウエストにぬける", "骨盤の上をぬけて前側まで"],
        10: ["スタートの位置が正しい（身体をまっすぐにする）", "足の膝をもって、胸にまっ十分に近づけていく（膝を曲げてどの地土動くか確認する）", "左足：左手でふくらはぎの後ろを包み込むようにもつ。右手でひざをつつみ、足の中心の部分を膝からまっすぐ腹部に向かって、手をミトンのような形にしてマッサージする", "足を右側（外側）に倒し、右手で足を固定する", "左手で膝をつつみ、内側の大腿部分を膝から陰部に向かって、マッサージする", "小指が股関節にあたったら、親指をさらに深くマッサージできる", "左手で足を右手をちょうだいの手にして、大腿の裏側からお尻の部分を膝からお尻に向かってヒップアップをイメージしながらマッサージする", "一度足を中心に戻し、そのあとに左側（中側）に倒し、左手で足を固定する", "子供の太ももの外側の部分を右手で膝の部分からお尻に向かってマッサージする", "お尻のくぼんだ部分を右手の母指球の部分を使って、ぐるぐると体重をのせながら"]
    },
    2: {
        1: [
            "BHS歌のチェック項目1（今後アップデート予定）",
            "BHS歌のチェック項目2（今後アップデート予定）",
            "BHS歌のチェック項目3（今後アップデート予定）"
        ]
    },
    3: {
        1: [
            "BHS食と育ちのチェック項目1（今後アップデート予定）",
            "BHS食と育ちのチェック項目2（今後アップデート予定）",
            "BHS食と育ちのチェック項目3（今後アップデート予定）"
        ]
    },
    4: {
        1: [
            "BHS総合のチェック項目1（今後アップデート予定）",
            "BHS総合のチェック項目2（今後アップデート予定）",
            "BHS総合のチェック項目3（今後アップデート予定）"
        ]
    }
};

/* =========================================================
   ■ チェック画面の生成
   ========================================================= */
function findResult(category, topic, item, name) {
    return allResults.find(r => r.category === category && r.topic === topic && r.item === item && r.name === name);
}

function generateCheckScreen() {
    const items = categoryItems[selectedCategory][selectedTopic];
    const topicName = getTopicName(selectedCategory, selectedTopic);
    const topicCount = getCategoryTopicCount(selectedCategory);
    let html = `<h2 class="subtitle">【${categoryNames[selectedCategory]}：${selectedTopic}：${topicName}】</h2>`;

    items.forEach((item, itemIndex) => {
        html += `<div class="itemBlock">
            <div class="itemTitle">【${selectedTopic} ${topicName} ：項目${itemIndex + 1}】${item}</div>
            <div class="checksRow">`;

        studentNames.forEach((name, studentIndex) => {
            const saved = findResult(selectedCategory, selectedTopic, item, name);
            const isChecked = saved && saved.check === "○" ? "on" : "";
            html += `<div class="checkCell">
                    <span class="checkName">${name}</span>
                    <div class="checkBox ${isChecked}" id="chk_${itemIndex}_${studentIndex}"
                         onclick="toggleCheck('${itemIndex}_${studentIndex}'); saveCheck('${itemIndex}', '${studentIndex}')"></div>
                </div>`;
        });

        html += `</div><div class="notesLabel">備考：</div><div class="notesRow">`;

        studentNames.forEach((name, studentIndex) => {
            const saved = findResult(selectedCategory, selectedTopic, item, name);
            const noteValue = saved ? saved.note : "";
            html += `<div class="noteCell">${name}：
                    <textarea id="note_${itemIndex}_${studentIndex}" class="noteArea"
                              oninput="saveCheck('${itemIndex}', '${studentIndex}')">${noteValue}</textarea>
                </div>`;
        });
        html += `</div></div><hr>`;
    });

    document.getElementById("checkItems").innerHTML = html;
    window.scrollTo(0, 0);

    const backBtn = document.getElementById("checkBackBtn");
    const nextBtn = document.getElementById("checkNextBtn");
    if (backBtn) backBtn.textContent = selectedTopic === 1 ? "戻る" : "前の項目へ";
    if (nextBtn) nextBtn.textContent = selectedTopic === topicCount ? "完了" : "次の項目へ";
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
    const topicCount = getCategoryTopicCount(selectedCategory);
    if (selectedTopic < topicCount) {
        selectedTopic++;
        generateCheckScreen();
        saveAppState();
    } else {
        showScreen("finishScreen");
        saveAppState();
    }
}

function saveCurrentTopicToMemory() {
    const items = categoryItems[selectedCategory][selectedTopic];
    studentNames.forEach((name, studentIndex) => {
        items.forEach((item, itemIndex) => {
            const checkBtn = document.getElementById(`chk_${itemIndex}_${studentIndex}`);
            if (!checkBtn) return;
            const checked = checkBtn.classList.contains("on") ? "○" : "";
            const note = document.getElementById(`note_${itemIndex}_${studentIndex}`).value;

            let existing = findResult(selectedCategory, selectedTopic, item, name);
            if (existing) {
                existing.check = checked;
                existing.note = note;
            } else {
                allResults.push({ category: selectedCategory, topic: selectedTopic, item, name, check: checked, note });
            }
        });
    });
}

function saveCheck(itemIndex, studentIndex) {
    const items = categoryItems[selectedCategory][selectedTopic];
    const item = items[itemIndex];
    const name = studentNames[studentIndex];
    const checkBtn = document.getElementById(`chk_${itemIndex}_${studentIndex}`);
    if(!checkBtn) return;
    const checked = checkBtn.classList.contains("on") ? "○" : "";
    const note = document.getElementById(`note_${itemIndex}_${studentIndex}`).value;

    let existing = findResult(selectedCategory, selectedTopic, item, name);
    if (existing) {
        existing.check = checked;
        existing.note = note;
    } else {
        allResults.push({ category: selectedCategory, topic: selectedTopic, item, name, check: checked, note });
    }
}

function saveAllExcel() {
    const wb = XLSX.utils.book_new();
    studentNames.forEach(name => {
        const sheetData = [["カテゴリ", "お題", "項目", "チェック", "備考"]];

        [1, 2, 3, 4].forEach(category => {
            const topicCount = getCategoryTopicCount(category);
            for (let topic = 1; topic <= topicCount; topic++) {
                const items = categoryItems[category][topic];
                const topicName = getTopicName(category, topic);
                items.forEach(item => {
                    const row = allResults.find(r => r.category === category && r.topic === topic && r.item === item && r.name === name);
                    sheetData.push([categoryNames[category], topicName, item, row ? row.check : "", row ? row.note : ""]);
                });
            }
        });

        const ws = XLSX.utils.aoa_to_sheet(sheetData);
        ws['!cols'] = [{ wch: 20 }, { wch: 25 }, { wch: 80 }, { wch: 10 }, { wch: 90 }];
        const range = XLSX.utils.decode_range(ws['!ref']);
        for (let R = 0; R <= range.e.r; R++) {
            for (let C = 0; C <= range.e.c; C++) {
                const cellAddress = XLSX.utils.encode_cell({ r: R, c: C });
                if (!ws[cellAddress]) continue;
                ws[cellAddress].s = {
                    alignment: { wrapText: true, vertical: "top" },
                    font: { sz: 12 }
                };
            }
        }
        XLSX.utils.book_append_sheet(wb, ws, name);
    });

    const today = new Date();
    const fileName = `BHS_${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, "0")}${String(today.getDate()).padStart(2, "0")}.xlsx`;
    XLSX.writeFile(wb, fileName);
}
