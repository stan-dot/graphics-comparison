import { mat4 } from 'gl-matrix';
import { GraphicsBuffers } from './types/GraphicsBuffers.type';
import { ProgramInfo } from './types/ProgramInfo.type';

export function drawScene(
  gl: WebGL2RenderingContext,
  programInfo: ProgramInfo,
  buffers: GraphicsBuffers,
  deltaTime?: number,
  textures?: WebGLTexture,
): void {
  // console.log('drawing the scene');
  gl.clearColor(0.0, 0.0, 0.0, 1.0); // Clear to black, fully opaque
  gl.clearDepth(1.0); // Clear everything
  gl.enable(gl.DEPTH_TEST); // Enable depth testing
  gl.depthFunc(gl.LEQUAL); // Near things obscure far things

  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  // Create a perspective matrix, a special matrix that is
  // used to simulate the distortion of perspective in a camera.
  // Our field of view is 45 degrees, with a width/height
  // ratio that matches the display size of the canvas
  // and we only want to see objects between 0.1 units
  // and 100 units away from the camera.

  const fieldOfView = (45 * Math.PI) / 180; // in radians
  const canvas = gl.canvas as HTMLCanvasElement;
  const aspect = canvas.clientWidth ?? 1 / canvas.clientHeight ?? 1;
  const zNear = 0.1;
  const zFar = 100.0;
  const projectionMatrix = mat4.create();

  mat4.perspective(projectionMatrix, fieldOfView, aspect, zNear, zFar);

  // Set the drawing position to the "identity" point, which is
  // the center of the scene.
  const modelViewMatrix: mat4 = mat4.create();

  // Now move the drawing position a bit to where we want to
  // start drawing the square.

  mat4.translate(
    modelViewMatrix, // destination matrix
    modelViewMatrix, // matrix to translate
    [-0.0, 0.0, -6.0],
  ); // amount to translate

  let squareRotation = 0.0;
  const cubeRotation = deltaTime! * 0.7;
  mat4.rotate(modelViewMatrix, modelViewMatrix, cubeRotation, [0, 1, 0]);

  mat4.rotate(
    modelViewMatrix, // destination matrix
    modelViewMatrix, // matrix to rotate
    deltaTime ?? squareRotation, // amount to rotate in radians
    [0, 0, 1], // axis to rotate around
  );

  gl = bindVertexPositions(gl, buffers, programInfo);
  // gl = bindVertexColor(gl, buffers, programInfo);
  gl = bindTextures(gl, buffers, programInfo);
  gl = bindIndices(gl, buffers);
  gl = bindShading(gl, buffers, programInfo);

  gl.useProgram(programInfo.program);

  gl.uniformMatrix4fv(
    programInfo.uniformLocations.projectionMatrix,
    false,
    projectionMatrix,
  );
  gl.uniformMatrix4fv(
    programInfo.uniformLocations.modelViewMatrix,
    false,
    modelViewMatrix,
  );
  const normalMatrix = mat4.create();
  mat4.invert(normalMatrix, modelViewMatrix);
  mat4.transpose(normalMatrix, normalMatrix);


  gl.uniformMatrix4fv(
    programInfo.uniformLocations.normalMatrix!,
    false,
    normalMatrix,
  );

  // Tell WebGL we want to affect texture unit 0
  gl.activeTexture(gl.TEXTURE0);

  // Bind the texture to texture unit 0
  gl.bindTexture(gl.TEXTURE_2D, textures!);

  // Tell the shader we bound the texture to texture unit 0
  gl.uniform1i(programInfo.uniformLocations.uSampler!, 0);

  {
    const offset = 0;
    const vertexCount = 4;
    gl.drawArrays(gl.TRIANGLE_STRIP, offset, vertexCount);
  }
}

function bindIndices(
  gl: WebGL2RenderingContext,
  buffers: GraphicsBuffers,
): WebGL2RenderingContext {
  // Tell WebGL which indices to use to index the vertices
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers.indices!);
  const vertexCount = 36;
  const type = gl.UNSIGNED_SHORT;
  const offset = 0;
  gl.drawElements(gl.TRIANGLES, vertexCount, type, offset);
  return gl;
}

function bindVertexColor(
  gl: WebGL2RenderingContext,
  buffers: GraphicsBuffers,
  programInfo: ProgramInfo,
): WebGL2RenderingContext {
  const numComponents = 4;
  const type = gl.FLOAT;
  const normalize = false;
  const stride = 0;
  const offset = 0;
  gl.bindBuffer(gl.ARRAY_BUFFER, buffers.color!);
  gl.vertexAttribPointer(
    programInfo.attribLocations.vertexColor!,
    numComponents,
    type,
    normalize,
    stride,
    offset,
  );
  gl.enableVertexAttribArray(programInfo.attribLocations.vertexColor!);
  return gl;
}

function bindVertexPositions(
  gl: WebGL2RenderingContext,
  buffers: GraphicsBuffers,
  programInfo: ProgramInfo,
): WebGL2RenderingContext {
  const numComponents = 3; // pull out 3 values per iteration
  const type = gl.FLOAT; // the data in the buffer is 32bit floats
  const normalize = false; // don't normalize
  const stride = 0; // how many bytes to get from one set of values to the next
  // 0 = use type and numComponents above
  const offset = 0; // how many bytes inside the buffer to start from
  gl.bindBuffer(gl.ARRAY_BUFFER, buffers.position!);
  gl.vertexAttribPointer(
    programInfo.attribLocations.vertexPosition,
    numComponents,
    type,
    normalize,
    stride,
    offset,
  );
  gl.enableVertexAttribArray(programInfo.attribLocations.vertexPosition);
  return gl;
}

function bindTextures(
  gl: WebGL2RenderingContext,
  buffers: GraphicsBuffers,
  programInfo: ProgramInfo,
): WebGL2RenderingContext {
  // tell webgl how to pull out the texture coordinates from buffer
  const num = 2; // every coordinate composed of 2 values
  const type = gl.FLOAT; // the data in the buffer is 32-bit float
  const normalize = false; // don't normalize
  const stride = 0; // how many bytes to get from one set to the next
  const offset = 0; // how many bytes inside the buffer to start from
  gl.bindBuffer(gl.ARRAY_BUFFER, buffers.textureCoord!);
  gl.vertexAttribPointer(
    programInfo.attribLocations.textureCoord!,
    num,
    type,
    normalize,
    stride,
    offset,
  );
  gl.enableVertexAttribArray(programInfo.attribLocations.textureCoord!);

  return gl;
}

function bindShading(
  gl: WebGL2RenderingContext,
  buffers: GraphicsBuffers,
  programInfo: ProgramInfo,
): WebGL2RenderingContext {
  // Tell WebGL how to pull out the normals from
  // the normal buffer into the vertexNormal attribute.
  {
    const numComponents = 3;
    const type = gl.FLOAT;
    const normalize = false;
    const stride = 0;
    const offset = 0;
    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.normal!);
    gl.vertexAttribPointer(
      programInfo.attribLocations.vertexNormal!,
      numComponents,
      type,
      normalize,
      stride,
      offset,
    );
    gl.enableVertexAttribArray(programInfo.attribLocations.vertexNormal!);
  }
  return gl;
}
