const EDITABLE_SCRIPT = `
<script>
(function() {
  var style = document.createElement('style');
  style.textContent = \`
    [contenteditable] {
      cursor: text;
      transition: outline 0.15s;
      outline: 1px dashed transparent;
      border-radius: 2px;
    }
    [contenteditable]:hover {
      outline: 1px dashed rgba(255,255,255,0.3);
    }
    [contenteditable]:focus {
      outline: 1px solid rgba(100,150,255,0.6);
    }
  \`;
  document.head.appendChild(style);

  var selectors = 'h1,h2,h3,h4,h5,h6,p,span,li,td,th,a,label,blockquote';
  document.querySelectorAll(selectors).forEach(function(el) {
    el.setAttribute('contenteditable', 'true');
  });
})();
</script>`;

function injectEditableScript(html: string): string {
  const bodyClose = html.lastIndexOf("</body>");
  if (bodyClose !== -1) {
    return html.slice(0, bodyClose) + EDITABLE_SCRIPT + html.slice(bodyClose);
  }
  return html + EDITABLE_SCRIPT;
}

export default function PreviewPanel({ html }: { html?: string }) {
  if (!html) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-50">
        <p className="text-gray-400 text-sm">
          Draw on the left canvas and click Generate
        </p>
      </div>
    );
  }

  return (
    <iframe
      srcDoc={injectEditableScript(html)}
      sandbox="allow-scripts"
      className="w-full h-full border-0"
      title="Slide Preview"
    />
  );
}
