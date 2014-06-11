define(['eight/core/geometry'], function(geometry)
{
  // The numbering of the front face, seen from the front is
  //   5
  //  3 4
  // 0 1 2 
  // The numbering of the back face, seen from the front is
  //   B
  //  9 A
  // 6 7 8 
  // There are 12 vertices in total.
  var vertices =
  [
    // front face
    0.0, 0.0, 0.0,  // 0
    1.0, 0.0, 0.0,  // 1
    2.0, 0.0, 0.0,  // 2
    0.5, 1.0, 0.0,  // 3
    1.5, 1.0, 0.0,  // 4
    1.0, 2.0, 0.0,  // 5

    // rear face
    0.0, 0.0, -2.0, // 6
    1.0, 0.0, -2.0, // 7
    2.0, 0.0, -2.0, // 8
    0.5, 1.0, -2.0, // 9
    1.5, 1.0, -2.0, // A=10
    1.0, 2.0, -2.0, // B=11
  ];

  // I'm not sure why the left and right side have 4 faces, but the botton only 2.
  // Symmetry would suggest making them the same.
  // There are 18 faces in total.
  var triangles =
  [
    //front face
    0,1,3,
    1,3,4,  // clockwise
    1,2,4,
    3,4,5,
    
    //rear face
    6,7,9,  // clockwise
    7,9,10,
    7,8,10, // clockwise
    9,10,11, // clockwise
    
    //left side
    0,3,6,
    3,6,9,  // clockwise
    3,5,9,
    5,9,11, // clockwise
    
    //right side
    2,4,8, // clockwise
    4,8,10,
    4,5,10, // clockwise
    5,10,11,
    //bottom faces
    0,6,8,
    8,2,0
  ];

  var colors =
  [
    //front face  
     0.0, 0.0, 1.0,
     1.0, 1.0, 1.0,
     0.0, 0.0, 1.0,
     0.0, 0.0, 1.0,
     0.0, 0.0, 1.0,
     1.0, 1.0, 1.0,
  
    //rear face
     0.0, 1.0, 1.0,
     1.0, 1.0, 1.0,
     0.0, 1.0, 1.0,
     0.0, 1.0, 1.0,
     0.0, 1.0, 1.0,
     1.0, 1.0, 1.0
  ];

  var constructor = function(spec, my)
  {
    my = my || {};

    var api = geometry(spec, my);

    api.vertices = vertices;
    api.vertexIndices = triangles;
    api.colors = colors;

    return api;
  };

  return constructor;
});