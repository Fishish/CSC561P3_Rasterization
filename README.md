# Program 3 - Rasterization

## Introduction
A program that reads an online input file for a series of triangles and uses WebGL to render those triangles in an HTML canvas element. Triangles are defined by a series of vertices, and then the index values of those vertices to define the shape the triangles make (triangle, square, etc.). Additional data stored in the triangles json objects contains information about the coloring of the triangles. For each triangle, ambient, specular, and diffuse color data is stored that is systematically read by the shader to calculate the color of the triangle.

You can manipulate the 3d environment to perform a series of transformations. To translate the camera left and right along the x-axis, use a and d respectively. To translate forward and backward along the z-axis, use w and s. To translate up and down along the y-axis, use q and e respectively. To rotate the camera left and right along the y-axis, use A and D respectively. To rotate forward and backward along the x-axis, use W and S respectively. You can also select individual objects in the environment. You can cycle through objects by using the left and right arrow keys, and you can deselect by using the spacebar. To translate the selected object left and right along the x-axis, use k and ; respectively. To translate forward and backward along the z-axis, use o and l respectively. To translate up and down along the y-axis, use i and p respectively. To rotate left or right around the y-axis, use K and : respectively. To rotate forward and backward along the x-axis, use O and L respectively. Lastly, to rotate clockwise and counterclockwise, use I and P respectively.

If a different JSON file needs to be used, the global variable INPUT_TRIANGLES_URL should be changed. The new link should make sure it matches the format specified in the current link for this variable to ensure triangles are rendered correctly.

## Author
Connor Smith, Jiacheng Yang
