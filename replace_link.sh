rm -rf local_jdk local_config_cc
for i in $(find . -type l)
do
	cp $i ${i}.bk
	rm $i
	mv ${i}.bk $i
done
