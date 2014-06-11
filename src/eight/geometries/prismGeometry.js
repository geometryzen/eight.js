define(['eight/core/geometry','eight/math/e3ga/vectorE3'], function(geometry, vectorE3)
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
  var vertexList =
  [
    // front face
    vectorE3(0.0, 0.0, 0.0),
    vectorE3(1.0, 0.0, 0.0),
    vectorE3(2.0, 0.0, 0.0),
    vectorE3(0.5, 1.0, 0.0),
    vectorE3(1.5, 1.0, 0.0),
    vectorE3(1.0, 2.0, 0.0),

    // rear face
    vectorE3(0.0, 0.0, -2.0),
    vectorE3(1.0, 0.0, -2.0),
    vectorE3(2.0, 0.0, -2.0),
    vectorE3(0.5, 1.0, -2.0),
    vectorE3(1.5, 1.0, -2.0),
    vectorE3(1.0, 2.0, -2.0),
  ];

  // I'm not sure why the left and right side have 4 faces, but the botton only 2.
  // Symmetry would suggest making them the same.
  // There are 18 faces in total.
  var triangles =
  [
    //front face
    [0,1,3],
    [1,4,3],
    [1,2,4],
    [3,4,5],
    
    //rear face
    [6,9,7],
    [7,9,10],
    [7,10,8],
    [9,11,10],
    
    //left side
    [0,3,6],
    [3,9,6],
    [3,5,9],
    [5,11,9],
    
    //right side
    [2,8,4],
    [4,8,10],
    [4,10,5],
    [5,10,11],
    //bottom faces
    [0,6,8],
    [0,8,2]
  ];

  var constructor = function(spec, my)
  {
    my = my || {};

    var api = geometry(spec, my);

    api.triangles = triangles;
    api.vertices = [];
    api.normals = [];
    api.colors = [];

    for(var t=0;t<triangles.length;t++)
    {
      var triangle = triangles[t];

      // Normals will be the same for each vertex of a triangle.
      var v0 = vertexList[triangle[0]];
      var v1 = vertexList[triangle[1]];
      var v2 = vertexList[triangle[2]];

      var a = vectorE3(v1.x-v0.x, v1.y-v0.y, v1.z-v0.z);
      var b = vectorE3(v2.x-v0.x, v2.y-v0.y, v2.z-v0.z);

      var normal = vectorE3(a.y*b.z-a.z*b.y, a.z*b.x-a.x*b.z, a.x*b.y-a.y*b.x);

      for(var j=0;j<3;j++)
      {
        api.vertices.push(vertexList[triangle[j]].x);
        api.vertices.push(vertexList[triangle[j]].y);
        api.vertices.push(vertexList[triangle[j]].z);

        api.normals.push(normal.x);
        api.normals.push(normal.y);
        api.normals.push(normal.z);

        api.colors.push(1.0);
        api.colors.push(0.0);
        api.colors.push(0.0);
      }
    }
    return api;
  };

  return constructor;
});