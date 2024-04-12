import { useEffect, useState } from "react";
import Images from "next/image";

const data = {
    caption: {
        text: "1 & 2 BHK Luxury Apartments at just Rs.34.97 Lakhs",
        position: { x: 50, y: 100 },
        maxCharactersPerLine: 31,
        fontSize: 44,
        alignment: "left",
        textColor: "#FFFFFF"
    },
    cta: {
        text: "Shop Now",
        position: { x: 190, y: 320 },
        textColor: "#FFFFFF",
        backgroundColor: "#000000"
    },
    imageMask: {
        x: 56,
        y: 442,
        width: 970,
        height: 600
    },
    urls: {
        mask: "https://d273i1jagfl543.cloudfront.net/templates/global_temp_landscape_temp_10_mask.png",
        stroke: "https://d273i1jagfl543.cloudfront.net/templates/global_temp_landscape_temp_10_Mask_stroke.png",
        designPattern: "https://d273i1jagfl543.cloudfront.net/templates/global_temp_landscape_temp_10_Design_Pattern.png",
    }
};

class CanvasManager {
    constructor(canvasId, data) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.data = data;
    }

    breakTextIntoLines = (text, maxCharactersPerLine) => {
        const words = text.split(" ");
        const lines = [];
        let currentLine = '';
        let charactersCount = 0;

        words.forEach((word) => {
            if (charactersCount + word.length <= maxCharactersPerLine) {
                currentLine += word + ' ';
                charactersCount += word.length + 1;
            } else {
                lines.push(currentLine.trim());
                currentLine = word + ' ';
                charactersCount = word.length + 1;
            }
        });

        lines.push(currentLine.trim());
        return lines;
    };

    drawCanvas = (selectedColor, selectedCta, selectedCaption, selectedMask) => {
        const { ctx, canvas, data } = this;
        const { caption, cta, imageMask } = data;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw background color
        ctx.fillStyle = selectedColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Draw Design Pattern (Second Layer)
        const designPattern = new Image();
        designPattern.src = data.urls.designPattern + '?random=' + Math.random();
        designPattern.onload = () => {
            ctx.drawImage(designPattern, 0, 0, canvas.width, canvas.height);
        };

        // Draw Mask (Third Layer)
        const mask = new Image();
        mask.src = selectedMask;
        mask.onload = () => {
            ctx.drawImage(mask, imageMask.x, imageMask.y, imageMask.width, imageMask.height);

            // Draw white stroke around the mask image
            const strokeSize = 5;
            ctx.strokeStyle = "#FFFFFF";
            ctx.lineWidth = strokeSize;
            ctx.strokeRect(imageMask.x - strokeSize, imageMask.y - strokeSize, imageMask.width + 2 * strokeSize, imageMask.height + 2 * strokeSize);
        };

        // Draw Caption (Fourth Layer)
        if (caption) {
            ctx.font = `${caption.fontSize}px Arial`;
            ctx.fillStyle = caption.textColor;
            ctx.textAlign = caption.alignment;
            const lines = this.breakTextIntoLines(selectedCaption, caption.maxCharactersPerLine);
            let yPos = caption.position.y;
            lines.forEach((line) => {
                ctx.fillText(line, caption.position.x, yPos);
                yPos += caption.fontSize + 10;
            });
        }

        // Draw CTA (Fifth Layer)
        if (cta) {
            const { position, textColor, backgroundColor } = cta;
            const ctaText = selectedCta;
            const ctaFontSize = 30;
            const padding = 24;

            ctx.font = `${ctaFontSize}px Arial`;

            const textWidth = ctx.measureText(ctaText).width;
            const textHeight = ctaFontSize;

            const rectWidth = textWidth + (2 * padding);
            const rectHeight = textHeight + (2 * padding);

            const rectX = position.x - rectWidth / 2;
            const rectY = position.y - rectHeight / 2;

            ctx.fillStyle = backgroundColor;
            roundRect(ctx, rectX, rectY, rectWidth, rectHeight, 10);
            ctx.fillStyle = textColor;
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText(ctaText, position.x, position.y);
        }
    };

    clearCanvas = () => {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    };
}

export default function Editor() {
    const [selectedColor, setSelectedColor] = useState("#0369A1");
    const [selectedCaption, setSelectedCaption] = useState(data.caption.text);
    const [selectedCta, setSelectedCta] = useState(data.cta.text);
    const [selectedMask, setSelectedMask] = useState(data.urls.mask);
    const [colorHistory, setColorHistory] = useState(["#0369A1"]);

    useEffect(() => {
        if ('eyedropper' in document) {
            document.addEventListener('colorpicked', handleColorPicked);
        } else {
            console.log("EyeDropper API is not supported in this browser.");
        }

        return () => {
            document.removeEventListener('colorpicked', handleColorPicked);
        };
    }, []);

    useEffect(() => {
        const canvasManager = new CanvasManager("canvas", data);
        canvasManager.drawCanvas(selectedColor, selectedCta, selectedCaption, selectedMask);
        return () => {
            canvasManager.clearCanvas();
        };
    }, [selectedColor, selectedCta, selectedCaption, selectedMask]);

    const handleMaskChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = () => {
                let imageDataURL = reader.result;
                setSelectedMask(imageDataURL);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleColorPicked = (event) => {
        const pickedColor = event.target.value;
        setSelectedColor(pickedColor);
        setColorHistory(prevHistory => {
            const newHistory = [...prevHistory];
            if (newHistory.length >= 5) {
                newHistory.shift();
            }
            newHistory.push(pickedColor);
            return newHistory;
        });

    };

    return (
        <div className="bg-blue-600 flex items-center justify-center w-screen h-screen">
            <div className="flex items-center w-2/3 h-2/3 justify-between overflow-clip rounded-2xl bg-white">
                <div className="bg-[#f0f0f0] w-fit px-12 h-full flex items-center justify-center">
                    <canvas id="canvas" height="1080" width="1080" style={{ height: 400, width: 400 }}>
                        Canvas Not Supported!
                    </canvas>
                </div>
                <div className="h-full w-1/2">
                    <div className="flex items-center p-4 justify-end">
                        <div className="p-2 bg-gray-300 w-8 text-center h-8 flex items-center justify-center rounded-full">X</div>
                    </div>
                    <div className="px-12">
                        <h1 className="text-gray-900 text-center font-bold text-lg">Add Customization</h1>
                        <p className="text-gray-500 mt-2 mb-8 text-sm text-center">Customize your ad and get the template accordingly.</p>
                        <div className="text-xs border border-gray-300 flex p-2 rounded-md text-gray-500">
                            <div>
                                <Images src={'/upload.png'} alt={'U'} height={16} width={16} className={"mx-2"} />
                            </div>
                            <p>
                                Change the ad creative images.{" "}
                                <label className="text-blue-800 underline cursor-pointer text-xs font-bold">
                                    select file
                                    <input onChange={handleMaskChange} type="file" accept="image/*" className="hidden" />
                                </label>
                            </p>
                        </div>
                        <div className="flex justify-center my-5 w-full text-sm items-center text-gray-500">
                            <div className="w-1/3 h-0.5 bg-gray-300"></div>
                            <div className="w-fit mx-2 text-xs">
                                Edit Contents
                            </div>
                            <div className="w-1/3 h-0.5 bg-gray-300"></div>
                        </div>
                        <div className="border flex justify-between items-center p-2 my-6 border-gray-300 rounded-md text-gray-400 relative">
                            <div className="w-full">
                                <label className="text-xs text-gray-800 font-bold absolute z-10 -top-2 px-2 bg-white left-4">Ad Context</label>
                                <input onChange={(e) => { setSelectedCaption(e.target.value) }} type="text" placeholder={selectedCaption}
                                       className="w-full text-gray-800 p-1 placeholder-gray-800 font-semibold pb-0 text-xs outline outline-0" />
                            </div>
                            <div>
                                <Images src={'/star.png'} alt={''} height={16} width={16} />
                            </div>
                        </div>
                        <div className="border p-2 my-6 border-gray-300 rounded-md text-gray-400 relative">
                            <label className="text-xs text-gray-800 font-bold absolute z-10 -top-2 px-2 bg-white left-4">CTA</label>
                            <input onChange={(e) => { setSelectedCta(e.target.value) }} type="text" placeholder={selectedCta}
                                   className="w-full p-1 text-gray-800 placeholder-gray-800 font-semibold pb-0 text-xs outline outline-0" />
                        </div>
                        <div className="relative">
                            <h1 className="text-xs text-gray-800 my-3 font-semibold">Choose your color</h1>
                            <div className="flex items-center">
                                {colorHistory.map((color, index) => (
                                     <div key={index} className="rounded-full w-8 h-8 m-1 cursor-pointer"
                                         style={{backgroundColor: color}} onClick={() => setSelectedColor(color)}></div>
                                ))}
                                <label htmlFor="color-picker-input"
                                       className="bg-gray-300 rounded-full w-8 h-8 flex items-center justify-center cursor-pointer">+</label>
                                <input type="color" id="color-picker-input" value={selectedColor}
                                       onChange={(e)=>{handleColorPicked(e)}} className="hidden"/>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

const roundRect = (ctx, x, y, width, height, radius) => {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.arcTo(x + width, y, x + width, y + height, radius);
    ctx.arcTo(x + width, y + height, x, y + height, radius);
    ctx.arcTo(x, y + height, x, y, radius);
    ctx.arcTo(x, y, x + width, y, radius);
    ctx.closePath();
    ctx.fill();
};