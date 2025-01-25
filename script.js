let images = [];

document.getElementById('imageInput').addEventListener('change', handleImageUpload);
document.getElementById('generateGif').addEventListener('click', generateGif);
document.getElementById('downloadGif').addEventListener('click', downloadGif);

function handleImageUpload(e) {
    const files = Array.from(e.target.files);
    const previewContainer = document.getElementById('imagePreview');
    
    files.forEach(file => {
        const reader = new FileReader();
        reader.onload = function(event) {
            const index = images.length;
            images.push(event.target.result);
            
            const previewItem = document.createElement('div');
            previewItem.className = 'preview-item';
            previewItem.innerHTML = `
                <img src="${event.target.result}">
                <button class="remove-btn" data-index="${index}">×</button>
            `;
            
            previewContainer.appendChild(previewItem);
        };
        reader.readAsDataURL(file);
    });
}

function generateGif() {
    console.log('开始生成GIF...');
    
    if (images.length === 0) {
        alert('请先上传图片！');
        return;
    }

    console.log(`准备处理 ${images.length} 张图片`);

    try {
        const gif = new GIF({
            workers: 2,
            quality: 10,
            width: 800,
            height: 600,
            workerScript: './js/gif.worker.js',
            repeat: parseInt(document.getElementById('loops').value)
        });

        const delay = parseInt(document.getElementById('delay').value);
        console.log(`设置延迟时间: ${delay}ms`);

        let loadedImages = 0;
        
        images.forEach((imageData, index) => {
            const img = new Image();
            img.onload = function() {
                console.log(`图片 ${index + 1} 加载完成`);
                gif.addFrame(img, {delay: delay});
                loadedImages++;

                if (loadedImages === images.length) {
                    console.log('所有图片已加载，开始渲染GIF...');
                    gif.render();
                }
            };

            img.onerror = function() {
                console.error(`图片 ${index + 1} 加载失败`);
            };

            img.src = imageData;
        });

        gif.on('progress', function(p) {
            console.log(`GIF生成进度: ${Math.round(p * 100)}%`);
        });

        gif.on('finished', function(blob) {
            console.log('GIF生成完成！');
            const resultContainer = document.getElementById('result');
            resultContainer.innerHTML = `<img src="${URL.createObjectURL(blob)}">`;
            document.getElementById('downloadGif').disabled = false;
            window.generatedGif = blob;
        });

    } catch (error) {
        console.error('生成GIF时发生错误:', error);
        alert('生成GIF时发生错误，请查看控制台了解详情');
    }
}

function downloadGif() {
    if (!window.generatedGif) return;
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(window.generatedGif);
    link.download = 'generated.gif';
    link.click();
}

// 添加图片排序功能
document.getElementById('imagePreview').addEventListener('click', function(e) {
    if (e.target.classList.contains('remove-btn')) {
        const index = parseInt(e.target.dataset.index);
        images.splice(index, 1);
        e.target.parentElement.remove();
        
        // 更新剩余图片的索引
        const removeButtons = document.querySelectorAll('.remove-btn');
        removeButtons.forEach((btn, i) => {
            btn.dataset.index = i;
        });
    }
});

// 确保gif.js库加载完成
window.onload = function() {
    if (typeof GIF === 'undefined') {
        console.error('gif.js库未能正确加载！');
        alert('页面加载不完整，请刷新页面重试');
    } else {
        console.log('gif.js库已成功加载');
    }
}; 