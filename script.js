
        // script.js - JavaScript for rendering PDF with PDF.js, including page navigation

        // Replace 'bible.pdf' with your actual PDF file path
        const pdfUrl = 'https://mozilla.github.io/pdf.js/web/compressed.tracemonkey-pldi-09.pdf';

        let pdfDoc = null;
        let pageNum = 1;
        let pageRendering = false;
        let pageNumPending = null;
        const canvas = document.getElementById('pdf-canvas');
        const ctx = canvas.getContext('2d');
        const pageNumElement = document.getElementById('page-num');
        const pageCountElement = document.getElementById('page-count');
        const prevButton = document.getElementById('prev-page');
        const nextButton = document.getElementById('next-page');

        // Function to render a page
        function renderPage(num) {
            pageRendering = true;
            pdfDoc.getPage(num).then(page => {
                const viewport = page.getViewport({ scale: 1.5 }); // Adjust scale for better viewing
                canvas.height = viewport.height;
                canvas.width = viewport.width;

                const renderContext = {
                    canvasContext: ctx,
                    viewport: viewport
                };
                const renderTask = page.render(renderContext);

                renderTask.promise.then(() => {
                    pageRendering = false;
                    if (pageNumPending !== null) {
                        renderPage(pageNumPending);
                        pageNumPending = null;
                    }
                });
            });

            pageNumElement.textContent = `Page: ${num} of `;
            updateButtons();
        }

        // Queue page rendering if already rendering
        function queueRenderPage(num) {
            if (pageRendering) {
                pageNumPending = num;
            } else {
                renderPage(num);
            }
        }

        // Update navigation buttons
        function updateButtons() {
            prevButton.disabled = pageNum <= 1;
            nextButton.disabled = pageNum >= pdfDoc.numPages;
        }

        // Event listeners for buttons
        prevButton.addEventListener('click', () => {
            if (pageNum <= 1) return;
            pageNum--;
            queueRenderPage(pageNum);
        });

        nextButton.addEventListener('click', () => {
            if (pageNum >= pdfDoc.numPages) return;
            pageNum++;
            queueRenderPage(pageNum);
        });

        // Load the PDF
        pdfjsLib.getDocument(pdfUrl).promise.then(pdf => {
            pdfDoc = pdf;
            pageCountElement.textContent = pdfDoc.numPages;
            renderPage(pageNum);
        }).catch(error => {
            console.error('Error loading PDF:', error);
            alert('Failed to load PDF. Please check the file path.');
        });
  