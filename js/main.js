const views = document.querySelectorAll('.views')
views.forEach((view) => {
    view.addEventListener("click", () => {
        var flag = document.getElementById("synchronize").checked
        console.log(flag)
        if (flag == true) {
            document.getElementById("zfactor").style.display = 'inline'
            console.log("yay")
        }
        else {
            document.getElementById("zfactor").style.display = 'none'
        }
    })
})

var lview = OpenSeadragon({
    id: "osview1",
    prefixUrl: "openseadragon/images/",
    tileSources: {
        Image: {
            xmlns: "http://schemas.microsoft.com/deepzoom/2009",
            Url: "test-img/helloworld/output/helloworld_files/",
            Overlap: "1",
            Format: "png",
            TileSize: "128",
            Size: {
                Height: "46000",
                Width: "35400"
            }
        }
    }
});

var rview = OpenSeadragon({
    id: "osview2",
    prefixUrl: "openseadragon/images/",
    tileSources: {
        Image: {
            xmlns: "http://schemas.microsoft.com/deepzoom/2009",
            Url: "test-img/helloworld/output/helloworld_files/",
            Overlap: "1",
            Format: "png",
            TileSize: "128",
            Size: {
                Height: "46000",
                Width: "35400"
            }
        }
    }
});

let aspectratio = lview.viewport.getAspectRatio();

let leftloc = {
    xcen: lview.viewport.getCenter(true).x,
    ycen: ((lview.viewport.getCenter(true).x) / aspectratio),
    rot: 0
};

let rightloc = {
    xcen: rview.viewport.getCenter(true).x,
    ycen: ((lview.viewport.getCenter(true).x) / aspectratio),
    rot: 0
}

let center = new OpenSeadragon.Point(leftloc.xcen, leftloc.ycen);
let point1 = document.getElementById("loc1");
let point2 = document.getElementById("loc2");
lview.addOverlay(point1, center, OpenSeadragon.Placement.BOTTOM);
rview.addOverlay(point2, center, OpenSeadragon.Placement.BOTTOM);

let locflag = false;
let syncflag = false;
let lsync = false;
let rsync = false;
lview.zoomPerClick= 1.5;
rview.zoomPerClick= 1.5;

lview.addHandler('canvas-click', (event) => {
    if (locflag) {
        let loc = event.position;
        let point = lview.viewport.pointFromPixel(loc)
        lview.getOverlayById('loc1').update(point, OpenSeadragon.Placement.BOTTOM)
        lview.forceRedraw()
        leftloc.xcen = lview.getOverlayById('loc1').location.x;
        leftloc.ycen = lview.getOverlayById('loc1').location.y;
    }
});
rview.addHandler('canvas-click', (event) => {
    if (locflag) {
        let loc = event.position;
        let point = rview.viewport.pointFromPixel(loc)
        rview.getOverlayById('loc2').update(point, OpenSeadragon.Placement.BOTTOM)
        rview.forceRedraw()
        rightloc.xcen = rview.getOverlayById('loc2').location.x;
        rightloc.ycen = rview.getOverlayById('loc2').location.y;
    }
});

console.log(2*lview.viewport.getZoom());

lview.addHandler('zoom', (event) => {
    if (syncflag) {
        if (!rsync) {
            lsync = true;
            rview.viewport.zoomTo(lview.viewport.getZoom());
            let rpan = new OpenSeadragon.Point((rightloc.xcen + lview.viewport.getCenter().x - leftloc.xcen), (rightloc.ycen + lview.viewport.getCenter().y - leftloc.ycen));
            rview.viewport.panTo(rpan);
            lsync = false;
        }
    }
});

rview.addHandler('zoom', (event) => {
    if (syncflag) {
        if (!lsync) {
            rsync = true;
            lview.viewport.zoomTo(rview.viewport.getZoom());
            let lpan = new OpenSeadragon.Point((leftloc.xcen + rview.viewport.getCenter().x - rightloc.xcen), (leftloc.ycen + rview.viewport.getCenter().y - rightloc.ycen));
            lview.viewport.panTo(lpan);
            rsync = false;
        }
    }
});

lview.addHandler('pan', function (event) {
    if (syncflag) {
        if (!rsync) {
            lsync = true;
            rview.viewport.zoomTo(lview.viewport.getZoom());
            var PanPoint = new OpenSeadragon.Point(((lview.viewport.getCenter().x) - leftloc.xcen) + rightloc.xcen, ((lview.viewport.getCenter().y) - leftloc.ycen) + rightloc.ycen);
            rview.viewport.panTo(PanPoint);
            lsync = false;
        }
    }
});

rview.addHandler('pan', function (event) {
    if (syncflag) {
        if (!lsync) {
            rsync = true;
            lview.viewport.zoomTo(rview.viewport.getZoom());
            var PanPoint = new OpenSeadragon.Point(((rview.viewport.getCenter().x) - rightloc.xcen) + leftloc.xcen, ((rview.viewport.getCenter().y) - rightloc.ycen) + leftloc.ycen);
            lview.viewport.panTo(PanPoint);
            rsync = false;
        }
    }
});

let lrotate = document.getElementById('rot1');
let rrotate = document.getElementById('rot2');

lrotate.oninput = () => {
    lview.viewport.setRotation(lrotate.value);
    if (locflag) {
        leftloc.rot = lview.viewport.getRotation();
    }
    else if (syncflag) {
        let x = parseInt(lrotate.value) + rightloc.rot - leftloc.rot;
        if (x <= 0) {
            let mod = parseInt(Math.abs(x)) / 360;
            x = x + (mod + 1) * 360;
        }
        else if (x > 360) {
            let mod = Math.parseInt(x) / 360;
            x = x - mod * 360;
        }
        rview.viewport.setRotation(x);
        rrotate.value = x;
    }
}

rrotate.oninput = () => {
    rview.viewport.setRotation(rrotate.value);
    if (locflag) {
        rightloc.rot = rview.viewport.getRotation();
    }
    else if (syncflag) {
        let x = parseInt(rrotate.value) + leftloc.rot - rightloc.rot;
        if (x <= 0) {
            let mod = parseInt(Math.abs(x)) / 360;
            x = x + (mod + 1) * 360;
        }
        else if (x > 360) {
            let mod = Math.parseInt(x) / 360;
            x = x - mod * 360;
        }
        lview.viewport.setRotation(x);
        lrotate.value = x;
    }
}

const viewind = () => {
    var v= document.getElementById("independent").checked;
    if(v){
        locflag=false;
        syncflag= false;
        lview.zoomPerClick= 1.5;
        rview.zoomPerClick= 1.5;
    }
}

const viewsync= ()=>{
    if(document.getElementById('synchronize').checked){
        syncflag= true;
        locflag= false;
        lview.zoomPerClick= 1.5;
        rview.zoomPerClick= 1.5;
        rview.viewport.zoomTo(lview.viewport.getZoom());
        let rpan = new OpenSeadragon.Point((rightloc.xcen + lview.viewport.getCenter().x - leftloc.xcen), (rightloc.ycen + lview.viewport.getCenter().y - leftloc.ycen));
        rview.viewport.panTo(rpan);
    }
    else{
        synflag= false;
        locflag= true;
    }
}

const setloc= ()=>{
    if(document.getElementById('locate').checked){
        syncflag= false;
        locflag= true;
        lview.zoomPerClick=1;
        rview.zoomPerClick=1;
    }
    else{
        syncflag= false;
        locflag= false;
        lview.zoomPerClick=1.5;
        rview.zoomPerClick=1.5;
    }
}