/**
    Created By thinkmix 2017-5-23
    image to base64
    require 'exif-js' to check image orientation 
 */
import EXIF from "exif-js";

export default function (params) {
    var options={
        maxWidth:params.maxWidth||800,
        quality:params.quality||1,
        file:params.file,
        complete:function(data){
            params.complete(data);
        }
    },Orientation=null,Reader = new FileReader();

    if(["image/gif", "image/png", "image/jpeg", "image/bmp", "image/webp"].indexOf(options.file.type) < 0){
        throw new Error('Unsupported image types');
    }
    if(!FileReader){
        throw new Error('Unsupported FileReader');
    }

    var readerOnload = function (e) {

        var img = new Image();
        img.src = e.target.result;
        img.onload = function () {
            //console.log(this.naturalWidth,this.naturalHeight)
            var canvas = document.createElement('canvas'),
                   ctx = canvas.getContext('2d'),
            pixelRatio = img.width / img.height,
                     w = img.width>=1200 ? 1200 : img.width,
                     h = w / pixelRatio;

            //check error Orientation
            switch(Orientation){
                case 6://90deg
                    canvas.width=h;
                    canvas.height=w;
                    ctx.rotate(90 * Math.PI / 180);
                    ctx.drawImage(img,0,-h,w,h);
                    break;
                case 8://-90deg
                    canvas.width=h;
                    canvas.height=w;
                    ctx.rotate(270 * Math.PI / 180);
                    ctx.drawImage(img,-w,0,w,h);
                    break;
                case 3://180deg
                    canvas.width=w;
                    canvas.height=h;
                    ctx.rotate(180 * Math.PI / 180);
                    ctx.drawImage(img,-w,-h,w,h);
                    break;
                default:
                    canvas.width=w;
                    canvas.height=h;
                    ctx.drawImage(img,0,0,w,h);
                    break;
            }
            options.complete(canvas.toDataURL("image/jpeg",options.quality));
            canvas = null;
            img = null;
        };
    };
    
    EXIF.getData(options.file, function() {//get orientation
        EXIF.getAllTags(this);  
        Orientation = EXIF.getTag(this, 'Orientation');
        Reader.onload = readerOnload;
        Reader.readAsDataURL(options.file);
    });
}
