function applyTemplateWhenDocumentLoaded(templateData) {
    if(document.readyState === "complete") {
        applyTemplate(templateData);
    } else {
        document.addEventListener("DOMContentLoaded", () => applyTemplate(templateData));
    }
}

Handlebars.registerHelper('not', function (value) {
    return !value;
});

function compare(params) {
  if(params[3]){  //handle case insensitive conditions if 4 param is passed.
    params[0]= params[0].toLowerCase();
    params[2]= params[2].toLowerCase();
  }
  let v1 = params[0];
  let operator = params[1];
  let v2 = params[2];
  switch (operator) {
    case '==':
      return (v1 == v2);
    case '!=':
      return (v1 != v2);
    case '===':
      return (v1 === v2);
    case '<':
      return (v1 < v2);
    case '<=':
      return (v1 <= v2);
    case '>':
      return (v1 > v2);
    case '>=':
      return (v1 >= v2);
    case '&&':
      return !!(v1 && v2);
    case '||':
      return !!(v1 || v2);
    default:
      return false;
  }
}
Handlebars.registerHelper('eq', compare);



function applyTemplate(templateData) {
    let template;
    if (!window.template_cache) {
        window.template_cache = document.getElementById('template').innerHTML;
    }

    const render = window.Handlebars.compile(window.template_cache);
    document.getElementById('template').innerHTML = render(templateData);
}