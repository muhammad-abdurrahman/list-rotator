$(document).ready(function () {
    $("#header").val("*Monthly Qur'aan Khatm - Deadline:*");
    $("#footer").val(
        `*Juz 30 Allocation*
1. Ayyub (al-Naas - al-Ikhlaas)
2. Hamza (al-Masad - al-Bayyinah)
3. Aisha (al-Qadr - al-Ghaashiya)
4. Khalid (al-A'la - al-Naba')
        `
    );

    var input = document.querySelector('input.advance-options'),
        tagify = new Tagify(input, {
            pattern: /^.{0,20}$/,  // Validate typed tag(s) by Regex. Here maximum chars length is defined as "20"
            delimiters: null,        // add new tags when a comma or a space character is entered
            trim: false,        // if "delimiters" setting is using space as a delimeter, then "trim" should be set to "false"
            keepInvalidTags: true,         // do not remove invalid tags (but keep them marked as invalid)
            // createInvalidTags: false,
            editTags: {
                clicks: 2,              // single click to edit a tag
                keepInvalid: false      // if after editing, tag is invalid, auto-revert
            },
            transformTag: transformTag,
            backspace: "edit",
            placeholder: "Enter an item"
        })

    const names = [
        {value: "Momotaj"},
        {value: "Tahiyyah"},
        {value: "Sophia"},
        {value: "Majeda"},
        {value: "Tasmin"},
        {value: "Sidi"},
        {value: "Saifur's dad"},
        {value: "Samiha"},
        {value: "Nasima"},
        {value: "Muhsin"},
        {value: "Nazia"},
        {value: "Tabassum"},
        {value: "Muhibur"},
        {value: "Monira"},
        {value: "Mahdi"},
        {value: "Sumaiya"},
        {value: "Umar"},
        {value: "Nahid"},
        {value: "Tahibur"},
        {value: "Mahfuz"},
        {value: "Rifath"},
        {value: "Fatema"},
        {value: "Monjila"},
        {value: "Ruhul"},
        {value: "Minhaj"},
        {value: "Moshahid"},
        {value: "Mutahir"},
        {value: "Motia"},
        {value: "Fahmida"}
    ];
    tagify.addTags(names)

    tagify.on('change', updatePlaceholderByTagsCount);

    function updatePlaceholderByTagsCount() {
        tagify.setPlaceholder(`${tagify.value.length || 'no'} items added`)
    }

    updatePlaceholderByTagsCount()

// generate a random color (in HSL format, which I like to use)
    function getRandomColor() {
        function rand(min, max) {
            return min + Math.random() * (max - min);
        }

        var h = rand(1, 360) | 0,
            s = rand(40, 70) | 0,
            l = rand(65, 72) | 0;

        return 'hsl(' + h + ',' + s + '%,' + l + '%)';
    }

    function transformTag(tagData) {
        tagData.color = getRandomColor();
        tagData.style = "--tag-bg:" + tagData.color;

        tagData.value = `${tagify.value.length + 1}. ${tagData.value}`
    }

    tagify.on('add', function (e) {
        console.log(e.detail)
    })

    tagify.on('invalid', function (e) {
        console.log(e, e.detail);
    })

    var clickDebounce;

    tagify.on('click', function (e) {
        const {tag: tagElm, data: tagData} = e.detail;

        // a delay is needed to distinguish between regular click and double-click.
        // this allows enough time for a possible double-click, and only fires if such
        // did not occur.
        clearTimeout(clickDebounce);
        clickDebounce = setTimeout(() => {
            tagData.color = getRandomColor();
            tagData.style = "--tag-bg:" + tagData.color;
            tagify.replaceTag(tagElm, tagData);
        }, 200);
    })

    tagify.on('dblclick', function (e) {
        // when double-clicking, do not change the color of the tag
        clearTimeout(clickDebounce);
    })

    $("#rotate").on("click", function () {
        const item = $("#item").val();
        const position = $("#position").val();
        const header = $("#header").val();
        const footer = $("#footer").val();

        let rotatedNames;

        if (!item || !position) {
            rotatedNames = rotateNames(tagify.value, tagify.value[0].value, 2);
        } else {
            rotatedNames = rotateNames(tagify.value, item, position);
        }

        const outputEntries = [];

        if (header) {
            let lines = header.split('\n');
            lines.forEach((line, index) => {
                const isLastLine = index === lines.length - 1;
                const className = isLastLine ? 'text-body double-space-after' : 'text-body';
                outputEntries.push(`<div class="${className}">${line}</div>`);
            });
        }

        rotatedNames.forEach((n) => {
            outputEntries.push(`<div class="text-body">${n.value}</div>`);
        });

        if (footer) {
            let lines = footer.split('\n');
            lines.forEach((line, index) => {
                const isFirstLine = index === 0;
                const className = isFirstLine ? 'text-body double-space-before' : 'text-body';
                outputEntries.push(`<div class="${className}">${line}</div>`);
            });
        }

        const $out = $("#out");
        $out.empty();
        $out.addClass("border border-success-subtle rounded p-3")
        outputEntries.forEach((e) => $out.append(e));

        $("#copyBtn").removeClass("visually-hidden");
        $("#copyBtn").tooltip('dispose');

        tagify.removeAllTags();
        tagify.addTags(rotatedNames.map((n) => {
            n.value = n.value.split(/\.\s/).pop();
            return n;
        }))
    });

    $('[data-bs-toggle="tooltip"]').tooltip()

    $('input').click(function () {
        this.select();
    });

    $("#clear").on("click", function () {
        $(":input").val("");
        const $out = $("#out");
        $out.empty();
        $out.removeClass("border border-success-subtle rounded p-3");
        $("#copyBtn").addClass("visually-hidden");
        $("#copyBtn").tooltip('dispose');
    });


    $("#copyBtn").on("click", function () {
        const copiedText = extractText(document.getElementById("out"));

        // Copy the text to the clipboard
        navigator.clipboard.writeText(copiedText).then(function () {
            // Show tooltip indicating successful copy
            $("#copyBtn").tooltip('dispose');
            $("#copyBtn").tooltip({
                title: "Copied to clipboard",
                placement: "top"
            });
            $("#copyBtn").tooltip('show');
            setTimeout(function () {
                $("#copyBtn").tooltip('hide');
            }, 2000);
        }, function (err) {
            // Show error message in modal
            $("#copyErrorModalBody").text("Error copying text: " + err);
            $("#copyErrorModal").modal('show');
        });
    });

    function extractText(node) {
        let result = "";

        Array.from(node.children).forEach((child) => {
            if (child.className.toLowerCase().includes("text-")) {
                if (child.className.toLowerCase().includes("double-space-before")) {
                    result += "\n";
                }
                result += child.textContent + "\n";
                if (child.className.toLowerCase().includes("double-space-after")) {
                    result += "\n";
                }
            } else {
                result += "\n";
                Array.from(child.children).forEach((grandChild) => {
                    result += grandChild.textContent + "\n";
                });
            }
        });

        return result;
    }

    function rotateNames(names, targetName, targetPosition) {
        // Convert the targetName to lowercase for case-insensitive comparison
        const currentIndex = names.findIndex(name => name.value.toLowerCase().includes(targetName.toLowerCase()));

        if (currentIndex === -1) {
            throw new Error('Name not found in the list.');
        }

        const length = names.length;

        // Adjust for 1-based index (targetPosition is 1-based)
        const offset = (targetPosition - 1) - currentIndex;

        // Function to rotate the array
        const rotated = names.map((_, i) => names[(i - offset + length) % length]);

        rotated.map((n, i) => {
            n.value = `${i + 1}. ${n.value.split(/\.\s/).pop()}`;
            return n;
        })

        return rotated;
    }

});
