// tools used for creating custom exercises and other tools used for studying
// TODO: Custom Fill in the Blanks
Genki.tools = {
  type : '', // tool type defined by the document (e.g. vocab, spelling, quiz..)

  
  // adds a new row
  addRow : function (caller) {
    var newRow = caller.parentNode.cloneNode(true),
        list = caller.parentNode.parentNode,
        input = newRow.querySelectorAll('input, textarea'),
        i = input.length;

    // clear values
    while (i --> 0) {
      if (input[i].type == 'checkbox') {
        input[i].checked = false;
      } else {
        input[i].value = '';
      }
    }

    list.appendChild(newRow);
    list.scrollTop = 9999;

    this.updateJSON();
  },
  
  
  // removes the selected row
  removeRow : function (caller) {
    caller.parentNode.parentNode.removeChild(caller.parentNode);
    this.updateJSON();
  },
  
  
  // updates the list when the JSON is edited
  updateUI : function () {
    var code = document.getElementById('study-tool-json');

    if (!code.value) {
      code.value = this.type == 'quiz' ? '[{"question":"","answers":[""]}]' : '{"":""}';
    }

    var data = JSON.parse(code.value),
        buttons = 
        '<button class="button row-add" title="add" onclick="Genki.tools.addRow(this);"><i class="fa">&#xf067;</i></button>'+
        '<button class="button row-remove" title="remove" onclick="Genki.tools.removeRow(this);"><i class="fa">&#xf068;</i></button>',
        str = '',
        i, j, k, l, answers;

    // formatting for vocab rows
    if (this.type == 'vocab') {
      for (i in data) {
        str += 
        '<li class="item-row">'+
          '<input type="text" placeholder="word/kanji" oninput="Genki.tools.updateJSON();" value="' + (/\|/.test(i) ? i.split('|')[0] : i) + '">&nbsp;'+
          '<input type="text" placeholder="furigana (optional)" oninput="Genki.tools.updateJSON();" value="' + (/\|/.test(i) ? i.split('|')[1] : '') + '">&nbsp;'+
          '<input type="text" placeholder="definition/kana" oninput="Genki.tools.updateJSON();" value="' + data[i] + '">&nbsp;'+
          buttons+
        '</li>';
      }
    }
    
    // formatting for spelling rows
    else if (this.type == 'spelling') {
      for (i in data) {
        str += 
        '<li class="item-row">'+
          '<input type="text" placeholder="word/kanji" oninput="Genki.tools.updateJSON();" value="' + i + '">&nbsp;'+
          '<input type="text" placeholder="furigana (optional)" oninput="Genki.tools.updateJSON();" value="' + (data[i] ? data[i] : '') + '">&nbsp;'+
          buttons+
        '</li>';
      }
    }
    
    // formatting for quiz rows
    else if (this.type == 'quiz') {
      for (i = 0, j = data.length; i < j; i++) {
        
        // formatting answers for insertion into the string below
        for (answers = '', k = 0, l = data[i].answers.length; k < l; k++) {
          answers +=
          '<li class="quiz-answer">'+
            '<input type="checkbox" title="Correct answer" onchange="Genki.tools.updateJSON();"' + (/^A/.test(data[i].answers[k]) ? ' checked' : '') + '>'+
            '<input type="text" placeholder="answer" oninput="Genki.tools.updateJSON();" value="' + (/^A|!/.test(data[i].answers[k]) ? data[i].answers[k].slice(1) : data[i].answers[k]) + '">'+
            buttons+
          '</li>';
        }
        
        str += 
        '<li class="item-row question-row">'+
          '<textarea placeholder="question" oninput="Genki.tools.updateJSON();">' + data[i].question + '</textarea>'+
          buttons+
          '<ol>' + answers + '</ol>'+
        '</li>';
      }
    }

    document.getElementById('study-tool-ui').innerHTML = str;
  },
  
  
  // updates the custom vocabulary code when the list is edited
  updateJSON : function () {
    var row = document.getElementById('study-tool-ui').querySelectorAll('.item-row'),
        i = 0,
        j = row.length, k, l,
        code = {},
        input, json, answers, answerRow;

    // code formatting for custom vocab
    if (this.type == 'vocab') {
      for (; i < j; i++) {
        input = row[i].getElementsByTagName('INPUT');

        // 0 = word/kanji
        // 1 = furigana
        // 2 = definition/kana
        code[input[0].value + (input[1].value ? '|' + input[1].value : '')] =  input[2].value;
      }
    }
    
    // code formatting for spelling
    else if (this.type == 'spelling') {
      for (; i < j; i++) {
        input = row[i].getElementsByTagName('INPUT');

        // 0 = word/kanji
        // 1 = furigana
        code[input[0].value] = input[1].value;
      }
    }
    
    // code formatting for quizzes
    else if (this.type == 'quiz') {
      code = [];
      
      for (; i < j; i++) {
        
        // compile answers
        for (answers = [], answerRow = row[i].querySelectorAll('.quiz-answer'), k = 0, l = answerRow.length; k < l; k++) {
          input = answerRow[k].getElementsByTagName('INPUT');
          
          // 0 = checkbox (defines the correct answer)
          // 1 = answer texts
          answers[k] = (input[0].checked ? 'A' : '') + (!input[0].checked && /^A/.test(input[1].value) ? '!' : '') + input[1].value;
        }
        
        // add the formatted question to the question list
        code[i] = {
          question : row[i].getElementsByTagName('TEXTAREA')[0].value,
          answers : answers
        }
      }
    }

    json = document.getElementById('prettyCode').checked ? JSON.stringify(code, '', '  ') : JSON.stringify(code);
    document.getElementById('study-tool-json').value = json;
    
    // update download link
    document.getElementById('downloadCode').href = 'data:,' + encodeURIComponent(json.replace(/\n/g, '\r\n'));
    
    // save JSON to localStorage
    window.localStorage[{
      vocab : 'customVocab',
      spelling : 'customSpelling',
      quiz : 'customQuiz'
    }[this.type]] = json;
  },
  
  
  // restores data saved to localStorage
  restore : function () {
    var type = {
      vocab : 'customVocab',
      spelling : 'customSpelling',
      quiz : 'customQuiz'
    }[this.type];
    
    if (window.localStorage[type]) {
      document.getElementById('study-tool-json').value = window.localStorage[type];
      this.updateUI();
      this.updateJSON();

    } else {
      this.updateJSON();
    }
  },
  

  // begin studying a custom exercise
  study : function () {
    if (document.getElementById('noStudyWarning').checked || confirm('Are you sure you\'re ready to study? Your custom exercise will be temporarily saved to the browser cache, however, if you want to use it again later, click "cancel", then copy the code and save it to a text document. (click "do not warn me" to disable this message)')) {
      var quizlet = document.getElementById('study-tool-json').value
      // sanitization
      .replace(/<script.*?>/g, '<span>')
      .replace(/<\/script>/g, '</span>')
      .replace(/ on.*?=\\".*?\\"/g, '');
      
      document.getElementById('study-tool-editor').style.display = 'none';
      document.getElementById('exercise').style.display = '';
      
      // generate a vocab exercise
      if (this.type == 'vocab') {
        Genki.generateQuiz({
          type : 'drag',
          info : 'Match the definition/kana to the word/kanji.',

          quizlet : JSON.parse(quizlet)
        });
      }
      
      // generate a spelling exercise
      else if (this.type == 'spelling') {
        Genki.generateQuiz({
          type : 'writing',
          info : 'Practice spelling the following words.',

          columns : +document.getElementById('spellingColumns').value,
          quizlet : JSON.parse(quizlet)
        });
      }
      
      // generate a multi-choice quiz
      else if (this.type == 'quiz') {
        Genki.generateQuiz({
          type : 'multi',
          info : 'Answer the following questions.',
          
          quizlet : JSON.parse(quizlet)
        });
      }
    }
  },
  
  
  // general settings shared across tools
  settings : {
    
    // prettify the JSON code
    prettify : function (caller) {
      this.handleCheckbox(caller);
      Genki.tools.updateJSON();
    },
    
    
    // handle checkbox input
    handleCheckbox : function (caller, state) {
      if (state) {
        caller.checked = state == 'true' ? true : false;
      } else {
        window.localStorage[caller.id] = caller.checked;
      }
    },
    
    
    // function for restoring settings shared over various tools
    restore : function () {
      var settings = [
        'noStudyWarning', 
        'prettyCode'
      ],
      
      i = 0,
      j = settings.length;
      
      for (; i < j; i++) {
        if (window.localStorage[settings[i]]) {
          this.handleCheckbox(document.getElementById(settings[i]), window.localStorage[settings[i]]);
        }
      }
    }
    
  }
  
};