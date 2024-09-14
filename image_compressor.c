#include <stdio.h>
#include <stdlib.h>
#include <jpeglib.h>
#include <jerror.h>

#define DLL_EXPORT __declspec(dllexport)

DLL_EXPORT int compress_image(const char* input_path, const char* output_path, int quality) {
    struct jpeg_decompress_struct cinfo;
    struct jpeg_compress_struct cinfo_out;
    struct jpeg_error_mgr jerr;
    FILE *infile, *outfile;
    JSAMPARRAY buffer;
    int row_stride;

    // 打开输入文件
    if ((infile = fopen(input_path, "rb")) == NULL) {
        fprintf(stderr, "无法打开输入文件 %s\n", input_path);
        return -1;
    }

    // 初始化解压缩对象
    cinfo.err = jpeg_std_error(&jerr);
    jpeg_create_decompress(&cinfo);
    jpeg_stdio_src(&cinfo, infile);
    jpeg_read_header(&cinfo, TRUE);
    jpeg_start_decompress(&cinfo);

    row_stride = cinfo.output_width * cinfo.output_components;
    buffer = (*cinfo.mem->alloc_sarray)((j_common_ptr) &cinfo, JPOOL_IMAGE, row_stride, 1);

    // 打开输出文件
    if ((outfile = fopen(output_path, "wb")) == NULL) {
        fprintf(stderr, "无法创建输出文件 %s\n", output_path);
        jpeg_destroy_decompress(&cinfo);
        fclose(infile);
        return -2;
    }

    // 初始化压缩对象
    cinfo_out.err = jpeg_std_error(&jerr);
    jpeg_create_compress(&cinfo_out);
    jpeg_stdio_dest(&cinfo_out, outfile);

    cinfo_out.image_width = cinfo.output_width;
    cinfo_out.image_height = cinfo.output_height;
    cinfo_out.input_components = cinfo.output_components;
    cinfo_out.in_color_space = cinfo.out_color_space;

    jpeg_set_defaults(&cinfo_out);
    jpeg_set_quality(&cinfo_out, quality, TRUE);
    jpeg_start_compress(&cinfo_out, TRUE);

    // 逐行读取和压缩
    while (cinfo.output_scanline < cinfo.output_height) {
        jpeg_read_scanlines(&cinfo, buffer, 1);
        jpeg_write_scanlines(&cinfo_out, buffer, 1);
    }

    // 完成压缩
    jpeg_finish_compress(&cinfo_out);
    jpeg_destroy_compress(&cinfo_out);

    // 完成解压缩
    jpeg_finish_decompress(&cinfo);
    jpeg_destroy_decompress(&cinfo);

    fclose(infile);
    fclose(outfile);

    return 0; // 成功
}