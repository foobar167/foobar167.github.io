const canvas = document.getElementById('chaos-game');
const context  = canvas.getContext('2d');

const width  = window.innerWidth;
const height = window.innerHeight;

//Set canvas width and height
canvas.width  = width;
canvas.height = height;

function wavelengthToRGB(wavelength)
{   // Convert wavelength to RGB color. Approximately human eye vision.
    let red, green, blue;  // RGB colors
    if((wavelength >= 400.0) && (wavelength <= 440.0)) {
        red = -1.0 * ((wavelength - 440.0) / 40.0);
        green = 0.0;
        blue = 1.0;
    }
    else if((wavelength >= 440.0) && (wavelength <= 490.0)) {
        red = 0.0;
        green = (wavelength - 440.0) / 50.0;
        blue = 1.0;
    }
    else if((wavelength >= 490.0) && (wavelength <= 510.0)) {
        red = 0.0;
        green = 1.0;
        blue = -1.0 * ((wavelength - 510.0) / 20.0);
    }
    else if((wavelength >= 510.0) && (wavelength <= 580.0)) {
        red = (wavelength - 510.0) / 70.0;
        green = 1.0;
        blue = 0.0;
    }
    else if((wavelength >= 580.0) && (wavelength <= 645.0)) {
        red = 1.0;
        green = -1.0 * ((wavelength - 645.0) / 65.0);
        blue = 0.0;
    }
    else if((wavelength >= 645.0) && (wavelength <= 700.0)) {
        red = 1.0;
        green = 0.0;
        blue = 0.0;
    }
    return 'rgb(' + Math.floor(255*red)   + ',' +
                    Math.floor(255*green) + ',' +
                    Math.floor(255*blue)  + ')';
}

function chaos_game(vertices, // number of vertices
                    scale,    // distance multiplier
                    width,    // screen width
                    height,   // screen height
                    inColor)  // color mode
{   // Draw fractal itself
    const w = width / 2.0;
    const h = height / 2.0;

    const rotOffset = Math.PI * (2.0/vertices - 0.5);
    let   polyhedron = [];

    for (let i = 0; i < vertices; ++i)
    {
        const cx = (w / 2) * Math.cos((2.0*Math.PI*i / vertices) + rotOffset) + w;
        const cy = (h / 2) * Math.sin((2.0*Math.PI*i / vertices) + rotOffset) + h;

        polyhedron.push({x:cx, y:cy});
    }

    let vertex = 0; // starting point in zero vertex
    let rx = polyhedron[vertex].x;
    let ry = polyhedron[vertex].y;

    context.clearRect(0, 0, width, height); // Clear screen from previous drawing
    // Add text to the canvas
    context.font = '16px Arial';
    context.fillStyle = 'black';
    context.fillText('Use controls <Up>,<Down>,<Left>,<Right> or <Space>', 10, 20);
    context.fillText('For color press <1> or <2>', 10, 40);
    context.fillText('Vertices: ' + vertices + '; Scale: ' + scale.toFixed(3), 10, 60);

    const iterations = 20000;
    for (let i = 0; i < iterations; i++)
    {
        vertex = Math.floor(Math.random() * vertices); // randomly choose vertex
        const dx = polyhedron[vertex].x - rx; // x-distance from vertex to point
        const dy = polyhedron[vertex].y - ry; // y-distance from vertex to point
        rx += scale * dx; // new x-position of the point
        ry += scale * dy; // new y-position of the point

        if (inColor)
        {   // Set color to the image
            const dist = Math.sqrt(dx * dx + dy * dy);
            const wl = 400.0 + 300.0 * dist / h;
            context.fillStyle = wavelengthToRGB(wl);
        }

        context.fillRect(rx, ry, 1, 1); // draw a point as a rectangle
    }
}

const upper_limit = 1.6;
const lower_limit = 0.3;
const max_vertices = 12;
const min_vertices = 3;
const interval = 1; // repeat in milliseconds
let vertices = min_vertices;
let scale = lower_limit;
let step = 0.005;
let is_color = true;

let id = setInterval(frame, interval); // repeat periodically

function frame()
{   // Draw fractal with appropriate parameters
    if (scale > upper_limit && vertices > max_vertices)
    {   // Stop the cycle
        clearInterval(id);
        return;
    }
    
    if (scale > upper_limit || scale < lower_limit)
    {   // Add one more vertex to polyhedron and reverse scale alteration
        vertices++;
        step = - step;
    }
    
    scale += step;
    chaos_game(vertices, scale, width, height, is_color);
}

let is_moving = true;
document.body.onkeydown = function(e) // Keyboard management
{   // Execute after pressing space bar
    if (e.keyCode === 32)
    {
        switch (is_moving)
        {
            case true: // Stop the cycle
                clearInterval(id);
                break;
            case false: // Continue the cycle
                id = setInterval(frame, interval);
                break;
        }
        is_moving = !is_moving;
    }

    if (e.keyCode >= 37 && e.keyCode <= 40)
    {
        clearInterval(id); // Stop the cycle
        
        switch (e.keyCode)
        {
            case 37: // left arrow
                scale -= step; // Move 1 step backward
                break;
            case 38: // up arrow
                scale += step * 10; // Move 10 steps forward
                break;
            case 39: // right arrow
                scale += step; // Move 1 step forward
                break;
            case 40: // down arrow
                scale -= step * 10; // Move 10 steps backward
                break;
        }
        
        if (scale < lower_limit || scale > upper_limit)
        {
            switch (e.keyCode)
            {
                case 37: // left arrow
                case 40: // down arrow
                    if (vertices > min_vertices) { vertices--; step = -step; } // move backward
                    break;
                case 38: // up arrow
                case 39: // right arrow
                    if (vertices < max_vertices) { vertices++; step = -step; } // move forward
                    break;
            }
        }
        if (scale < lower_limit) { scale = lower_limit; }
        if (scale > upper_limit) { scale = upper_limit; }

        chaos_game(vertices, scale, width, height, is_color); // draw canvas
    }

    if (e.keyCode === 49 || e.keyCode === 50)
    {
        switch (e.keyCode)
        {
            case 49: // '1' key
                is_color = true;
                break;
            case 50: // '2' key
                is_color = false;
                break;
        }
        chaos_game(vertices, scale, width, height, is_color); // draw canvas
    }
};
